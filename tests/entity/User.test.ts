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

import { Connection, Repository, SelectQueryBuilder } from "typeorm";
import { User } from "../../src/entity/User";
import bcrypt, { hash } from "bcryptjs";

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

describe('EditBasicDetails', () => {
	test('Expect properties are updated', () => {
		const user = new User('userId', 'email', 'username', 'password', true, true, true);

		user.EditBasicDetails('newEmail', 'newUsername', 'newPassword');

		expect(user.Email).toBe('newEmail');
		expect(user.Username).toBe('newUsername');
		expect(user.Password).toBe('newPassword');
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

describe('RegisterUser', () => {
    test('Given values are valid, expect user to be registered', async () => {
	let user: User;

	repositoryMock.findAndCount.mockResolvedValue([null, 0]);

	repositoryMock.find.mockResolvedValue([]);

	repositoryMock.save.mockImplementation(async (u: any) => {
	    user = u;
	});

	const result = await User.RegisterUser('username', 'email', 'password', 'password');

	expect(result).toBeTruthy();
	expect(repositoryMock.save).toBeCalledTimes(1);
	expect(user).toBeDefined();
	expect(user.Admin).toBeTruthy();
    });

    test('Given passwords do not match, expect error', async () => {
	const result = await User.RegisterUser('username', 'email', 'password', 'passwordRepeat');

	expect(result).toBeFalsy();
    });

    test('Given password length is less than 7, expect error', async () => {
	const result = await User.RegisterUser('username', 'email', 'one', 'one');

	expect(result).toBeFalsy();
    });

    test('Given email is already taken, expect error', async () => {
	const user = mock<User>();
	user.Id = 'userId';
	user.Email = 'email';

	repositoryMock.findAndCount
	    .mockResolvedValueOnce([[user], 1])
	    .mockResolvedValue([[], 0]);
	
	const result = await User.RegisterUser('username', 'email', 'password', 'password');

	expect(result).toBeFalsy();
    });

    test('Given username is already taken, expect error', async () => {
	const user = mock<User>();
	user.Id = 'userId';
	user.Username = 'username';

	repositoryMock.findAndCount
	    .mockResolvedValueOnce([[], 0])
	    .mockResolvedValue([[user], 1]);
	
	const result = await User.RegisterUser('username', 'email', 'password', 'password');

	expect(result).toBeFalsy();
    });

    test('Given user is not the first user to register, expect user to not be an admin', async () =>
    {
	const adminUser = mock<User>();
	adminUser.Active = true;
	adminUser.Admin = true;

	let user: User;

	repositoryMock.findAndCount.mockResolvedValue([null, 0]);

	repositoryMock.find.mockResolvedValue([adminUser]);

	repositoryMock.save.mockImplementation(async (u: any) => {
	    user = u;
	});

	const result = await User.RegisterUser('username', 'email', 'password', 'password');

	expect(result).toBeTruthy();
	expect(repositoryMock.save).toBeCalledTimes(1);
	expect(user).toBeDefined();
	expect(user.Admin).toBeFalsy();
    });
});

describe('GetUser', () => {
    test('Given user can be found, expect user returned', async () => {
	const user = mock<User>();
	user.Id = 'userId';

	repositoryMock.findOne.mockResolvedValue(user);

	const result = await User.GetUser('userId');

	expect(result).toBe(user);
    });

    test('Given user can not be found, expect null returned', async () => {
	repositoryMock.findOne.mockResolvedValue(null);

	const result = await User.GetUser('userId');

	expect(result).toBeNull();
    });
});

describe('GetUserByEmailAddress', () => {
    test('Given user can be found, expect user returned', async () => {
	const user = mock<User>();
	user.Id = 'userId';
	user.Email = 'email';

	repositoryMock.findOne.mockResolvedValue(user);

	const result = await User.GetUserByEmailAddress('email');

	expect(result).toBe(user);
    });

    test('Given user can not be found, expect null returned', async () => {
	repositoryMock.findOne.mockResolvedValue(null);

	const result = await User.GetUserByEmailAddress('email');

	expect(result).toBeNull();
    });
});

describe('GetUserByUsername', () => {
	test('Given user can be found, expect user returned', async () => {
		const user = mock<User>();
		user.Id = 'userId';
		user.Username = 'username';

		repositoryMock.findOne.mockResolvedValue(user);

		const result = await User.GetUserByUsername('username');

		expect(result).toBe(user);
		expect(repositoryMock.findOne).toBeCalledWith({ Username: 'username' });
	});

	test('Given user can not be found, expect null returned', async () => {
		repositoryMock.findOne.mockResolvedValue(null);

		const result = await User.GetUserByUsername('username');

		expect(result).toBe(null);
		expect(repositoryMock.findOne).toBeCalledWith({ Username: 'username' });
	});
});

describe('UpdateCurrentUserDetails', () => {
	test('Given user can be found AND values do not exist, expect success', async () => {
		const user = mock<User>();
		user.Id = 'userId';
		user.Email = 'email';
		user.Username = 'username';
		user.Password = 'password';
		
		repositoryMock.findOne.mockResolvedValue(user);
		repositoryMock.save.mockResolvedValue(user);
		bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
		User.GetUserByEmailAddress = jest.fn().mockResolvedValue(null);
		User.GetUserByUsername = jest.fn().mockResolvedValue(null);
		
		const result = await User.UpdateCurrentUserDetails(user, 'newEmail', 'newUsername', 'newPassword');

		expect(result.IsSuccess).toBeTruthy();
		expect(repositoryMock.findOne).toBeCalledWith('userId');
		expect(bcrypt.hash).toBeCalledWith('newPassword', 10);
		expect(user.EditBasicDetails).toBeCalledWith('newEmail', 'newUsername', 'hashedPassword');
		expect(repositoryMock.save).toBeCalledWith(user);
	});

	test('Given user can not be found, expect failure', async () => {
		const user = mock<User>();
		user.Id = 'userId';
		user.Email = 'email';
		user.Username = 'username';
		user.Password = 'password';

		repositoryMock.findOne.mockResolvedValue(null);
		
		const result = await User.UpdateCurrentUserDetails(user, 'newEmail', 'newUsername', 'newPassword');

		expect(result.IsSuccess).toBeFalsy();
		expect("user not found");
	});

	test('Given email is already used, expect failure', async () => {
		const user = mock<User>();
		user.Id = 'userId';
		user.Email = 'email';
		user.Username = 'username';
		user.Password = 'password';
		
		repositoryMock.findOne.mockResolvedValue(user);
		User.GetUserByEmailAddress = jest.fn().mockResolvedValue(user);
		
		const result = await User.UpdateCurrentUserDetails(user, 'newEmail', 'newUsername', 'newPassword');

		expect(result.IsSuccess).toBeFalsy();
		expect(result.Message).toBe('Email already in use');
	});

	test('Given username is already used, expect failure', async () => {
		const user = mock<User>();
		user.Id = 'userId';
		user.Email = 'email';
		user.Username = 'username';
		user.Password = 'password';

		repositoryMock.findOne.mockResolvedValue(user);
		User.GetUserByEmailAddress = jest.fn().mockResolvedValue(null);
		User.GetUserByUsername = jest.fn().mockResolvedValue(user);

		const result = await User.UpdateCurrentUserDetails(user, 'newEmail', 'newUsername', 'newPassword');

		expect(result.IsSuccess).toBeFalsy();
		expect(result.Message).toBe('Username already in use');
	});

	test('Given password is too short, expect failure', async () => {
		const user = mock<User>();
		user.Id = 'userId';

		repositoryMock.findOne.mockResolvedValue(user);
		User.GetUserByEmailAddress = jest.fn().mockResolvedValue(null);
		User.GetUserByUsername = jest.fn().mockResolvedValue(null);

		const result = await User.UpdateCurrentUserDetails(user, 'newEmail', 'newUsername', 'short');

		expect(result.IsSuccess).toBeFalsy();
		expect(result.Message).toBe('Password must be at least 7 characters long');
	});
});