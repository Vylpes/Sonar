import { mock } from "jest-mock-extended";

const repositoryMock = mock<Repository<any>>();
const connectionMock = mock<Connection>();
const qbuilderMock = mock<SelectQueryBuilder<any>>();

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
import { Project } from "../../src/entity/Project";
import { ProjectUser } from "../../src/entity/ProjectUser";
import { User } from "../../src/entity/User";

beforeEach(() => {
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

describe('Static', () => {
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
});
