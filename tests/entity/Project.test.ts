import { mock } from "jest-mock-extended";

const connectionMock = mock<Connection>();
const qbuilderMock = mock<SelectQueryBuilder<any>>();

let repositoryMock = mock<Repository<any>>();
let projectMock = mock<Project>();

jest.mock('typeorm', () => {
    qbuilderMock.where.mockReturnThis();
    qbuilderMock.select.mockReturnThis();
    repositoryMock.createQueryBuilder.mockReturnValue(qbuilderMock);
    repositoryMock.findOne.mockImplementation(async () => {
        return projectMock;
    });
    connectionMock.getRepository.mockReturnValue(repositoryMock);

    return {
        getConnection: () => connectionMock,

        BaseEntity: class Mock {},
        ObjectType: () => {},
        Entity: () => {},
        InputType: () => {},
        Index: () => {},
        PrimaryColumn: () => {},
        Column: () => {},
        CreateDateColumn: () => {},
        UpdateDateColumn: () => {},
        OneToMany: () => {},
        ManyToOne: () => {},
    }
});

import { Connection, Repository, SelectQueryBuilder } from "typeorm";
import { UserProjectRole } from "../../src/constants/UserProjectRole";
import { Project } from "../../src/entity/Project";
import { ProjectUser } from "../../src/entity/ProjectUser";
import { User } from "../../src/entity/User";

beforeEach(() => {
    // Repository Mock
    repositoryMock = mock<Repository<any>>();
    
    repositoryMock.createQueryBuilder.mockReturnValue(qbuilderMock);
    repositoryMock.findOne.mockImplementation(async () => {
        return projectMock;
    });
    connectionMock.getRepository.mockReturnValue(repositoryMock);
    
    // Project Mock
    projectMock = mock<Project>();
});

describe('Constructor', () => {
    test('Expect parameters to be set', () => {
        const date = new Date();
        const user = {} as unknown as User;

        const project = new Project('projectId', 'name', 'description', 'prefix', date, false, user);

        expect(project.Id).toBe('projectId');
        expect(project.Name).toBe('name');
        expect(project.Description).toBe('description');
        expect(project.TaskPrefix).toBe('prefix');
        expect(project.CreatedAt).toBe(date);
        expect(project.Archived).toBeFalsy();
        expect(project.CreatedBy).toBe(user);
        expect(project.NextTask).toBe(1);
    });
});

describe('EditValues', () => {
    test('Expect values to be updated', () => {
        const date = new Date();
        const user = {} as unknown as User;

        const project = new Project('projectId', 'name', 'description', 'prefix', date, false, user);

        project.EditValues('new name', 'new description');

        expect(project.Name).toBe('new name');
        expect(project.Description).toBe('new description');
    });
});

describe('EditNextTask', () => {
    test('Expect values to be updated', () => {
        const date = new Date();
        const user = {} as unknown as User;

        const project = new Project('projectId', 'name', 'description', 'prefix', date, false, user);

        project.EditNextTask(2);

        expect(project.NextTask).toBe(2);
    });
});

describe('EditProject', () => {
    test('Given user has permission, expect values to be updated', async () => {
        const user = {} as unknown as User;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        const result = await Project.EditProject('projectId', 'new name', 'new description', user);

        expect(result).toBeTruthy();
        expect(projectMock.EditValues).toBeCalledWith('new name', 'new description');
    });

    test('Given user does not have permission, expect return false', async () => {
        const user = {} as unknown as User;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

        const result = await Project.EditProject('projectId', 'new name', 'new description', user);

        expect(result).toBeFalsy();
        expect(projectMock.EditValues).not.toBeCalled();
    });

    test('Given project is not found, expect return false', async () => {
        repositoryMock.findOne.mockImplementation(async () => {
            return null;
        })

        const user = {} as unknown as User;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        const result = await Project.EditProject('projectId', 'new name', 'new description', user);

        expect(result).toBeFalsy();
        expect(projectMock.EditValues).not.toBeCalled();
    });
}); 

describe('GetAllProjects', () => {
    test('Given user has projects assigned, expect list with projects', async () => {
        const currentUser = mock<User>();
        currentUser.Id = "userId";

        const project = mock<Project>();
        
        const projectUser = mock<ProjectUser>();
        projectUser.User = currentUser;
        projectUser.Project = project;

        repositoryMock.find.mockImplementation(async () => {
            return [projectUser];
        });

        const result = await Project.GetAllProjects(currentUser);

        expect(result.length).toBe(1);
        expect(result).toContain(project);
    });

    test('Given user has no projects assigned, expect empty list', async () => {
        const currentUser = mock<User>();
        currentUser.Id = "userId";

        repositoryMock.find.mockImplementation(async () => {
            return [];
        });

        const result = await Project.GetAllProjects(currentUser);

        expect(result.length).toBe(0);
    });

    test('Given project users exist but not current user, expect empty list', async () => {
        const currentUser = mock<User>();
        currentUser.Id = "userId";

        const anotherUser = mock<User>();
        anotherUser.Id = "anotherUserId";

        const project = mock<Project>();
        
        const projectUser = mock<ProjectUser>();
        projectUser.User = anotherUser;
        projectUser.Project = project;

        repositoryMock.find.mockImplementation(async () => {
            return [projectUser];
        });

        const result = await Project.GetAllProjects(currentUser);

        expect(result.length).toBe(0);
    });
});

describe('CreateProject', () => {
    test('Expect project to be created and user assigned', async () => {
        let savedProject: Project;
        let savedProjectUser: ProjectUser;

        repositoryMock.save.mockImplementationOnce(async (project) => {
            savedProject = project as Project;
        }).mockImplementation(async (projectUser) => {
            savedProjectUser = projectUser as ProjectUser;
        });

        const currentUser = mock<User>();

        const result = await Project.CreateProject('name', 'description', 'taskPrefix', currentUser);

        expect(result.Name).toBe('name');
        expect(repositoryMock.save).toBeCalledTimes(2);

        expect(savedProject).toBeDefined();
        expect(savedProjectUser).toBeDefined();

        expect(savedProject.Name).toBe('name');
        expect(savedProject.Description).toBe('description');
        expect(savedProject.TaskPrefix).toBe('taskPrefix');
        expect(savedProject.CreatedBy).toBe(currentUser);
        expect(savedProject.Archived).toBe(false);

        expect(savedProjectUser.Project).toBe(savedProject);
        expect(savedProjectUser.User).toBe(currentUser);
        expect(savedProjectUser.Role).toBe(UserProjectRole.Admin);
    });
});

describe('GetProject', () => {
    test('If user has permission to view, return project', async () => {
        const user = {} as unknown as User;

        const project = mock<Project>();
        project.Id = "projectId";

        repositoryMock.findOne.mockResolvedValue(project);

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        const result = await Project.GetProject('projectId', user);

        expect(result).toBe(project);
    });

    test('If user does not have permission to view, return null', async () => {
        const user = {} as unknown as User;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

        const result = await Project.GetProject('projectId', user);

        expect(result).toBeNull();
    });

    test('If project does not exist, return null', async () => {
        const user = {} as unknown as User;

        repositoryMock.findOne.mockResolvedValue(null);

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        const result = await Project.GetProject('projectId', user);

        expect(result).toBeNull();
    });
});

describe('GetNextTask', () => {
    test('If user has permission, return next task and increment', async () => {
        const user = {} as unknown as User;

        const project = mock<Project>();
        project.Id = 'projectId';
        project.NextTask = 1;
        
        project.EditNextTask.mockImplementation((num) => {
            project.NextTask = num;
        });

        repositoryMock.findOne.mockResolvedValue(project);

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        const result = await Project.GetNextTask('projectId', user);

        expect(result).toBe(1);
        expect(project.NextTask).toBe(2);
        expect(project.EditNextTask).toBeCalledWith(2);
    });

    test('If user does not have permission, return null', async () => {
        const user = {} as unknown as User;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

        const result = await Project.GetNextTask('projectId', user);

        expect(result).toBeNull();
    });

    test('If project can not be found, return null', async () => {
        const user = {} as unknown as User;

        repositoryMock.findOne.mockResolvedValue(null);

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        const result = await Project.GetNextTask('projectId', user);

        expect(result).toBeNull();
    });
});