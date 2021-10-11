import { mock } from "jest-mock-extended";

const connectionMock = mock<Connection>();
const qbuilderMock = mock<SelectQueryBuilder<any>>();

let repositoryMock = mock<Repository<any>>();
let userMock = mock<User>();

jest.mock('typeorm', () => {
    qbuilderMock.where.mockReturnThis();
    qbuilderMock.select.mockReturnThis();
    repositoryMock.createQueryBuilder.mockReturnValue(qbuilderMock);
    repositoryMock.findOne.mockImplementation(async () => {
	return userMock;
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

import { Connection, FindConditions, Repository, SelectQueryBuilder } from "typeorm";
import { Project } from "../../src/entity/Project";
import { ProjectUser } from "../../src/entity/ProjectUser";
import { User } from "../../src/entity/User";
import { Task } from "../../src/entity/Task";
import { hash } from "bcrypt";

beforeEach(() => {
    // Repository Mock
    repositoryMock = mock<Repository<any>>();

    repositoryMock.createQueryBuilder.mockReturnValue(qbuilderMock);
    repositoryMock.findOne.mockImplementation(async () => {
	    return userMock;
    });
    connectionMock.getRepository.mockReturnValue(repositoryMock);

    // User Mock
    userMock = mock<User>();
});

describe('Constructor', () => {
    test('Expect properties are set', () => {
        const user = new User('userId', 'email', 'username', 'password', true, true, true);

        expect(user.Id).toBe('userId');
        expect(user.Email).toBe('email');
        expect(user.Username).toBe('username');
        expect(user.Password).toBe('password');
        expect(user.Verified).toBeTruthy();
        expect(user.Admin).toBeTruthy();
        expect(user.Active).toBeTruthy();
    });
});

describe('IsLoginCorrect', () => {
    test('Given email and password match, expect true returned', async () => {
        const user = mock<User>();
        user.Id = 'userId';
        user.Email = 'email';
        user.Password = await hash('password', 10);

        repositoryMock.findOne.mockResolvedValue(user);

        const result = await User.IsLoginCorrect('email', 'password');

        expect(result).toBeTruthy();
    });

    test('Given email is incorrect, expect false returned', async () => {
        const user = mock<User>();
        user.Id = 'userId';
        user.Email = 'email';
        user.Password = await hash('password', 10);

        repositoryMock.findOne.mockResolvedValue(null);

        const result = await User.IsLoginCorrect('email2', 'password');

        expect(result).toBeFalsy();
    });

    test('Given password is incorrect, expect false returned', async () => {
        const user = mock<User>();
        user.Id = 'userId';
        user.Email = 'email';
        user.Password = await hash('password', 10);

        repositoryMock.findOne.mockResolvedValue(user);

        const result = await User.IsLoginCorrect('email', 'password2');

        expect(result).toBeFalsy();
    });
});