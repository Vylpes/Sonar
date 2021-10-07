import { mock } from "jest-mock-extended";

const connectionMock = mock<Connection>();
const qbuilderMock = mock<SelectQueryBuilder<any>>();

let repositoryMock = mock<Repository<any>>();
let projectUserMock = mock<ProjectUser>();

jest.mock('typeorm', () => {
    qbuilderMock.where.mockReturnThis();
    qbuilderMock.select.mockReturnThis();
    repositoryMock.createQueryBuilder.mockReturnValue(qbuilderMock);
    repositoryMock.findOne.mockImplementation(async () => {
        return projectUserMock;
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
import { UserProjectPermissions, UserProjectRole } from "../../src/constants/UserProjectRole";
import { Project } from "../../src/entity/Project";
import { ProjectUser } from "../../src/entity/ProjectUser";
import { User } from "../../src/entity/User";

beforeEach(() => {
    // Repository Mock
    repositoryMock = mock<Repository<any>>();
    
    repositoryMock.createQueryBuilder.mockReturnValue(qbuilderMock);
    repositoryMock.findOne.mockImplementation(async () => {
        return projectUserMock;
    });
    connectionMock.getRepository.mockReturnValue(repositoryMock);
    
    // ProjectUser Mock
    projectUserMock = mock<ProjectUser>();
});

describe('Constructor', () => {
    test('Expect parameters to be set', () => {
        const project = mock<Project>();
        const user = mock<User>();

        const projectUser = new ProjectUser('projectUserId', UserProjectRole.Admin, project, user);

        expect(projectUser.Id).toBe('projectUserId');
        expect(projectUser.Role).toBe(UserProjectRole.Admin);
        expect(projectUser.Project).toBe(project);
        expect(projectUser.User).toBe(user);
    });
});

describe('UpdateRole', () => {
    test('Expect role to be updated', () => {
        const project = mock<Project>();
        const user = mock<User>();

        const projectUser = new ProjectUser('projectUserId', UserProjectRole.Admin, project, user);

        projectUser.UpdateRole(UserProjectRole.Member);

        expect(projectUser.Role).toBe(UserProjectRole.Member);
    });
});

describe('GetPermissions', () => {
    test('Given user is found, expect permissions to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const projectUser = new ProjectUser('projectUserId', UserProjectRole.Admin, project, user);

        repositoryMock.findOne.mockResolvedValueOnce(project).mockResolvedValueOnce(user).mockResolvedValue(projectUser);

        const result = await ProjectUser.GetPermissions('projectId', 'userId');

        expect(result).not.toBe(UserProjectPermissions.None);
    });

    test('Given project is not found, expect no permissions to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const projectUser = new ProjectUser('projectUserId', UserProjectRole.Admin, project, user);

        repositoryMock.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(user).mockResolvedValue(projectUser);

        const result = await ProjectUser.GetPermissions('projectId', 'userId');

        expect(result).toBe(UserProjectPermissions.None);
    });

    test('Given user is not found, expect no permissions to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const projectUser = new ProjectUser('projectUserId', UserProjectRole.Admin, project, user);

        repositoryMock.findOne.mockResolvedValueOnce(project).mockResolvedValueOnce(null).mockResolvedValue(projectUser);

        const result = await ProjectUser.GetPermissions('projectId', 'userId');

        expect(result).toBe(UserProjectPermissions.None);
    });

    test('Given projectUser is not found, expect no permissions to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        repositoryMock.findOne.mockResolvedValueOnce(project).mockResolvedValueOnce(user).mockResolvedValue(null);

        const result = await ProjectUser.GetPermissions('projectId', 'userId');

        expect(result).toBe(UserProjectPermissions.None);
    });
});

describe('GetRole', () => {
    test('Given projectUser exists, expect role to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const projectUser = new ProjectUser('projectUserId', UserProjectRole.Admin, project, user);

        repositoryMock.findOne.mockResolvedValueOnce(project).mockResolvedValueOnce(user).mockResolvedValue(projectUser);

        const result = await ProjectUser.GetRole('projectId', 'userId');

        expect(result).toBe(UserProjectRole.Admin);
    });

    test('Given project does not exist, expect null to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const projectUser = new ProjectUser('projectUserId', UserProjectRole.Admin, project, user);

        repositoryMock.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(user).mockResolvedValue(projectUser);

        const result = await ProjectUser.GetRole('projectId', 'userId');

        expect(result).toBeNull();
    });

    test('Given user does not exist, expect null to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const projectUser = new ProjectUser('projectUserId', UserProjectRole.Admin, project, user);

        repositoryMock.findOne.mockResolvedValueOnce(project).mockResolvedValueOnce(null).mockResolvedValue(projectUser);

        const result = await ProjectUser.GetRole('projectId', 'userId');

        expect(result).toBeNull();
    });

    test('Given projectUser does not exist, expect null to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        repositoryMock.findOne.mockResolvedValueOnce(user).mockResolvedValueOnce(user).mockResolvedValue(null);

        const result = await ProjectUser.GetRole('projectId', 'userId');

        expect(result).toBeNull();
    });
});

describe('HasPermission', () => {
    test('Given user has permission, expect true to be returned', async () => {
        ProjectUser.GetPermissions = jest.fn().mockResolvedValue(UserProjectPermissions.View);

        const result = await ProjectUser.HasPermission('projectId', 'userId', UserProjectPermissions.View);
        
        expect(result).toBeTruthy();
    });

    test('Given user has permission with others, expect true to be returned', async () => {
        ProjectUser.GetPermissions = jest.fn().mockResolvedValue(UserProjectPermissions.View | UserProjectPermissions.Update);

        const result = await ProjectUser.HasPermission('projectId', 'userId', UserProjectPermissions.View);
        
        expect(result).toBeTruthy();
    });

    test('Given user requests multiple permissions, expect true to be returned', async () => {
        ProjectUser.GetPermissions = jest.fn().mockResolvedValue(UserProjectPermissions.View | UserProjectPermissions.Update);

        const result = await ProjectUser.HasPermission('projectId', 'userId', UserProjectPermissions.View | UserProjectPermissions.Update);
        
        expect(result).toBeTruthy();
    });

    test('Given user has no permissions, expect false to be returned', async () => {
        ProjectUser.GetPermissions = jest.fn().mockResolvedValue(UserProjectPermissions.None);

        const result = await ProjectUser.HasPermission('projectId', 'userId', UserProjectPermissions.View);
        
        expect(result).toBeFalsy();
    });

    test('Given user requests multiple permissions but does not have all, expect false to be returned', async () => {
        ProjectUser.GetPermissions = jest.fn().mockResolvedValue(UserProjectPermissions.View);

        const result = await ProjectUser.HasPermission('projectId', 'userId', UserProjectPermissions.View | UserProjectPermissions.Update);
        
        expect(result).toBeFalsy();
    });
});

describe('AssignUserToProject', () => {
    test('Given user has permission, expect user to be assigned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        Project.GetProject = jest.fn().mockResolvedValue(project);
        User.GetUser = jest.fn().mockResolvedValue(user);

        const result = await ProjectUser.AssignUserToProject('projectId', 'userId', currentUser);

        expect(result.Project).toBe(project);
        expect(result.User).toBe(user);
        expect(result.Role).toBe(UserProjectRole.Member);

        expect(repositoryMock.save).toBeCalledWith(result);
    });

    test('Given user does not have permission, expect null returned', async () => {
        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

        const result = await ProjectUser.AssignUserToProject('projectId', 'userId', currentUser);

        expect(result).toBeNull();
        expect(repositoryMock.save).not.toBeCalled();
    });

    test('Given project does not exist, expect null returned', async () => {
        const user = mock<User>();
        user.Id = 'userId';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        Project.GetProject = jest.fn().mockResolvedValue(null);
        User.GetUser = jest.fn().mockResolvedValue(user);

        const result = await ProjectUser.AssignUserToProject('projectId', 'userId', currentUser);

        expect(result).toBeNull();
        expect(repositoryMock.save).not.toBeCalled();
    });

    test('Given user does not exist, expect null returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        Project.GetProject = jest.fn().mockResolvedValue(project);
        User.GetUser = jest.fn().mockResolvedValue(null);

        const result = await ProjectUser.AssignUserToProject('projectId', 'userId', currentUser);

        expect(result).toBeNull();
        expect(repositoryMock.save).not.toBeCalled();
    });
});

describe('UnassignUserFromProject', () => {
    test('Given user has permission, expect user to be unassigned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser = mock<ProjectUser>();
        projectUser.Id = 'projectUserId';
        projectUser.Project = project;
        projectUser.User = user;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        Project.GetProject = jest.fn().mockResolvedValue(project);
        User.GetUser = jest.fn().mockResolvedValue(user);

        repositoryMock.findOne.mockResolvedValue(projectUser);

        const result = await ProjectUser.UnassignUserFromProject('projectId', 'userId', currentUser);

        expect(result).toBeTruthy();
        expect(repositoryMock.remove).toBeCalledWith(projectUser);
    });

    test('Given user does not have permission, expect false to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser = mock<ProjectUser>();
        projectUser.Id = 'projectUserId';
        projectUser.Project = project;
        projectUser.User = user;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

        Project.GetProject = jest.fn().mockResolvedValue(project);
        User.GetUser = jest.fn().mockResolvedValue(user);

        repositoryMock.findOne.mockResolvedValue(projectUser);

        const result = await ProjectUser.UnassignUserFromProject('projectId', 'userId', currentUser);

        expect(result).toBeFalsy();
        expect(repositoryMock.remove).not.toBeCalled();
    });

    test('Given project is not found, expect false to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser = mock<ProjectUser>();
        projectUser.Id = 'projectUserId';
        projectUser.Project = project;
        projectUser.User = user;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        Project.GetProject = jest.fn().mockResolvedValue(null);
        User.GetUser = jest.fn().mockResolvedValue(user);

        repositoryMock.findOne.mockResolvedValue(projectUser);

        const result = await ProjectUser.UnassignUserFromProject('projectId', 'userId', currentUser);

        expect(result).toBeFalsy();
        expect(repositoryMock.remove).not.toBeCalled();
    });

    test('Given user is not found, expect false to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser = mock<ProjectUser>();
        projectUser.Id = 'projectUserId';
        projectUser.Project = project;
        projectUser.User = user;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        Project.GetProject = jest.fn().mockResolvedValue(project);
        User.GetUser = jest.fn().mockResolvedValue(null);

        repositoryMock.findOne.mockResolvedValue(projectUser);

        const result = await ProjectUser.UnassignUserFromProject('projectId', 'userId', currentUser);

        expect(result).toBeFalsy();
        expect(repositoryMock.remove).not.toBeCalled();
    });

    test('Given projectUser is not found, expect false to be returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user = mock<User>();
        user.Id = 'userId';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser = mock<ProjectUser>();
        projectUser.Id = 'projectUserId';
        projectUser.Project = project;
        projectUser.User = user;

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        Project.GetProject = jest.fn().mockResolvedValue(project);
        User.GetUser = jest.fn().mockResolvedValue(user);

        repositoryMock.findOne.mockResolvedValue(null);

        const result = await ProjectUser.UnassignUserFromProject('projectId', 'userId', currentUser);

        expect(result).toBeFalsy();
        expect(repositoryMock.remove).not.toBeCalled();
    });
});

describe('GetAllUsersNotInProject', () => {
    test('Given user has permission, expect list returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user1 = mock<User>();
        user1.Id = 'user1Id';

        const user2 = mock<User>();
        user2.Id = 'user2Id';

        const user3 = mock<User>();
        user3.Id = 'user3Id';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser1 = mock<ProjectUser>();
        projectUser1.Id = 'projectUser1Id';
        projectUser1.Project = project;
        projectUser1.User = user1;

        const projectUser2 = mock<ProjectUser>();
        projectUser2.Id = 'projectUser1Id';
        projectUser2.Project = project;
        projectUser2.User = user2;

        project.ProjectUsers = [projectUser1, projectUser2];

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        repositoryMock.findOne.mockResolvedValue(project);
        repositoryMock.find.mockResolvedValue([user1, user2, user3]);

        const result = await ProjectUser.GetAllUsersNotInProject('projectId', currentUser);

        expect(result.length).toBe(1);
        expect(result[0]).toBe(user3);
    });

    test('Given user does not have permission, expect empty list returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user1 = mock<User>();
        user1.Id = 'user1Id';

        const user2 = mock<User>();
        user2.Id = 'user2Id';

        const user3 = mock<User>();
        user3.Id = 'user3Id';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser1 = mock<ProjectUser>();
        projectUser1.Id = 'projectUser1Id';
        projectUser1.Project = project;
        projectUser1.User = user1;

        const projectUser2 = mock<ProjectUser>();
        projectUser2.Id = 'projectUser1Id';
        projectUser2.Project = project;
        projectUser2.User = user2;

        project.ProjectUsers = [projectUser1, projectUser2];

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

        repositoryMock.findOne.mockResolvedValue(project);
        repositoryMock.find.mockResolvedValue([user1, user2, user3]);

        const result = await ProjectUser.GetAllUsersNotInProject('projectId', currentUser);

        expect(result.length).toBe(0);
    });

    test('Given project is not found, expect empty list returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user1 = mock<User>();
        user1.Id = 'user1Id';

        const user2 = mock<User>();
        user2.Id = 'user2Id';

        const user3 = mock<User>();
        user3.Id = 'user3Id';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser1 = mock<ProjectUser>();
        projectUser1.Id = 'projectUser1Id';
        projectUser1.Project = project;
        projectUser1.User = user1;

        const projectUser2 = mock<ProjectUser>();
        projectUser2.Id = 'projectUser1Id';
        projectUser2.Project = project;
        projectUser2.User = user2;

        project.ProjectUsers = [projectUser1, projectUser2];

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        repositoryMock.findOne.mockResolvedValue(null);
        repositoryMock.find.mockResolvedValue([user1, user2, user3]);

        const result = await ProjectUser.GetAllUsersNotInProject('projectId', currentUser);

        expect(result.length).toBe(0);
    });

    test('Given all users are added, expect empty list returned', async () => {
        const project = mock<Project>();
        project.Id = 'projectId';

        const user1 = mock<User>();
        user1.Id = 'user1Id';

        const user2 = mock<User>();
        user2.Id = 'user2Id';

        const user3 = mock<User>();
        user3.Id = 'user3Id';

        const currentUser = mock<User>();
        currentUser.Id = 'currentUserId';

        const projectUser1 = mock<ProjectUser>();
        projectUser1.Id = 'projectUser1Id';
        projectUser1.Project = project;
        projectUser1.User = user1;

        const projectUser2 = mock<ProjectUser>();
        projectUser2.Id = 'projectUser1Id';
        projectUser2.Project = project;
        projectUser2.User = user2;

        const projectUser3 = mock<ProjectUser>();
        projectUser3.Id = 'projectUser3Id';
        projectUser3.Project = project;
        projectUser3.User = user3;

        project.ProjectUsers = [projectUser1, projectUser2, projectUser3];

        ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

        repositoryMock.findOne.mockResolvedValue(project);
        repositoryMock.find.mockResolvedValue([user1, user2, user3]);

        const result = await ProjectUser.GetAllUsersNotInProject('projectId', currentUser);

        expect(result.length).toBe(0);
    });
});