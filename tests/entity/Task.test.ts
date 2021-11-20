import { mock } from "jest-mock-extended";

const connectionMock = mock<Connection>();
const qbuilderMock = mock<SelectQueryBuilder<any>>();

let repositoryMock = mock<Repository<any>>();
let taskMock = mock<Task>();

jest.mock('typeorm', () => {
    qbuilderMock.where.mockReturnThis();
    qbuilderMock.select.mockReturnThis();
    repositoryMock.createQueryBuilder.mockReturnValue(qbuilderMock);
    repositoryMock.findOne.mockImplementation(async () => {
	return taskMock;
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

beforeEach(() => {
    // Repository Mock
    repositoryMock = mock<Repository<any>>();

    repositoryMock.createQueryBuilder.mockReturnValue(qbuilderMock);
    repositoryMock.findOne.mockImplementation(async () => {
	return taskMock;
    });
    connectionMock.getRepository.mockReturnValue(repositoryMock);

    // Task Mock
    taskMock = mock<Task>();
});

describe('Constructor', () => {
    test('Expect properties are set', () => {
		const date = new Date();
		const user = {} as unknown as User;
		const project = mock<Project>();
		const parentTask = mock<Task>();

		const task = new Task('taskId', 1, 'name', 'description', user, date, false, false, project,
		user, parentTask);

		expect(task.Id).toBe('taskId');
		expect(task.TaskNumber).toBe(1);
		expect(task.Name).toBe('name');
		expect(task.Description).toBe('description');
		expect(task.CreatedBy).toBe(user);
		expect(task.CreatedAt).toBe(date);
		expect(task.Done).toBeFalsy();
		expect(task.Archived).toBeFalsy();
		expect(task.Project).toBe(project);
		expect(task.AssignedTo).toBe(user);
		expect(task.ParentTask).toBe(parentTask);
    });
});

describe('EditBasicValues', () => {
	test('Expect values to be edited', async () => {
		const date = new Date();
		const user = {} as unknown as User;
		const project = mock<Project>();
		const parentTask = mock<Task>();

		const task = new Task('taskId', 1, 'name', 'description', user, date, false, false, project,
		user, parentTask);

		task.EditBasicValues('newName', 'newDescription');

		expect(task.Name).toBe('newName');
		expect(task.Description).toBe('newDescription');
	});
});

describe('GetAllTasks', () => {
    test('Expect all visible tasks to be returned', async () => {
		const currentUser = mock<User>();
		currentUser.Id = 'userId';

		const project1 = mock<Project>();

		const project2 = mock<Project>();

		const task1A = mock<Task>();
		task1A.AssignedTo = currentUser;
		task1A.Project = project1;

		const task1B = mock<Task>();
		task1B.AssignedTo = currentUser;
		task1B.Project = project1;

		const task2A = mock<Task>();
		task2A.AssignedTo = currentUser;
		task2A.Project = project2;

		const projectUser1 = mock<ProjectUser>();
		projectUser1.User = currentUser;
		projectUser1.Project = project1;

		const projectUser2 = mock<ProjectUser>();
		projectUser2.User = currentUser;
		projectUser2.Project = project2;

		project1.Tasks = [ task1A, task1B ];
		project2.Tasks = [ task2A ];

		currentUser.AssignedProjects = [ projectUser1, projectUser2 ];

		repositoryMock.findOne.mockResolvedValue(currentUser);

		const result = await Task.GetAllTasks(currentUser);

		expect(result.length).toBe(3);
		expect(result).toContain(task1A);
		expect(result).toContain(task1B);
		expect(result).toContain(task2A);
    });
});

describe('GetAssignedTasks', () => {
    test('Given user exists, expect tasks returned', async () => {
		const task = mock<Task>();

		const user = mock<User>();
		user.Id = 'userId';
		user.AssignedTasks = [ task ];

		repositoryMock.findOne.mockResolvedValue(user);

		const result = await Task.GetAssignedTasks('userId');

		expect(result.length).toBe(1);
		expect(result).toContain(task);
		});

		test('Given user does not exist, expect null returned', async () => {
		repositoryMock.findOne.mockResolvedValue(null);

		const result = await Task.GetAssignedTasks('userId');

		expect(result).toBeNull();
    });
});

describe('CreateTask', () => {
    test('Given user has permission, expect task to be saved', async () => {
		const user = mock<User>();
		user.Id = 'userId';

		const project = mock<Project>();
		project.Id = 'projectId';
		project.NextTask = 1;
		
		Project.GetNextTask = jest.fn().mockImplementation(async (projectId: string, createdBy: User) => {
			return project.NextTask++;
		});

		ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);
		
		const result = await Task.CreateTask('name', 'description', user, project, null, null);

		expect(repositoryMock.save).toBeCalledWith(result);
		expect(result.Project).toBe(project);
		expect(result.CreatedBy).toBe(user);
		expect(project.NextTask).toBe(2);
    });

    test('Given user does not have permission, expect null to be returned', async () => {
		const user = mock<User>();
		user.Id = 'userId';

		const project = mock<Project>();
		project.Id = 'projectId';

		ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

		const result = await Task.CreateTask('name', 'description', user, project, null, null);

		expect(result).toBeNull();
		expect(repositoryMock.save).not.toBeCalled();
    });
});

describe('GetTaskByTaskString', () => {
	test('Given user has permission, expect task returned', async () => {
		const user = mock<User>();
		user.Id = 'userId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.CreatedBy = user;
		task.TaskNumber = 1;

		const project = mock<Project>();
		project.Tasks = [ task ];

		repositoryMock.findOne.mockImplementation(async (conditions: FindConditions<Project>) => {
			if (conditions.TaskPrefix == "TEST") {
				return project;
			}

			return null;
		});

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const result = await Task.GetTaskByTaskString('TEST-1', user);

		expect(result).toBe(task);
	});

	test('Given user does not have permission, expect null returned', async () => {
		const user = mock<User>();
		user.Id = 'userId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.CreatedBy = user;
		task.TaskNumber = 1;

		const project = mock<Project>();
		project.Tasks = [ task ];

		repositoryMock.findOne.mockImplementation(async (conditions: FindConditions<Project>) => {
			if (conditions.TaskPrefix == "TEST") {
				return project;
			}

			return null;
		});

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);

		const result = await Task.GetTaskByTaskString('TEST-1', user);

		expect(result).toBeNull();
	});

	test('Given project is null, expect null returned', async () => {
		const user = mock<User>();
		user.Id = 'userId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.CreatedBy = user;
		task.TaskNumber = 1;

		const project = mock<Project>();
		project.Tasks = [ task ];

		repositoryMock.findOne.mockResolvedValue(null);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const result = await Task.GetTaskByTaskString('TEST-1', user);

		expect(result).toBeNull();
	});

	test('Given task prefix search is invalid, expect null returned', async () => {
		const user = mock<User>();
		user.Id = 'userId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.CreatedBy = user;
		task.TaskNumber = 1;

		const project = mock<Project>();
		project.Tasks = [ task ];

		repositoryMock.findOne.mockImplementation(async (conditions: FindConditions<Project>) => {
			if (conditions.TaskPrefix == "TEST") {
				return project;
			}

			return null;
		});

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const result = await Task.GetTaskByTaskString('2', user);

		expect(result).toBeNull();
	});
});

describe('EditTask', () => {
	test('Given user has permission, expect task edited', async () => {
		const currentUser = mock<User>();
		currentUser.Id = 'userId';

		const project = mock<Project>();
		project.Id = 'projectId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.Name = 'name';
		task.Description = 'description';
		task.Project = project;

		repositoryMock.findOne
			.mockResolvedValueOnce(task);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const result = await Task.EditTask('taskId', 'newName', 'newDescription', currentUser);

		expect(result).toBeTruthy();
		expect(task.EditBasicValues).toBeCalledWith('newName', 'newDescription');
	});

	test('Given user does not have permission, expect false returned', async () => {
		const currentUser = mock<User>();
		currentUser.Id = 'userId';

		const project = mock<Project>();
		project.Id = 'projectId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.Name = 'name';
		task.Description = 'description';
		task.Project = project;

		repositoryMock.findOne
			.mockResolvedValueOnce(task);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);

		const result = await Task.EditTask('taskId', 'name', 'description', currentUser);

		expect(result).toBeFalsy();
		expect(task.EditBasicValues).not.toBeCalled();
	});

	test('Given taskId is null, expect false returned', async () => {
		const currentUser = mock<User>();
		currentUser.Id = 'userId';

		const project = mock<Project>();
		project.Id = 'projectId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.Name = 'name';
		task.Description = 'description';
		task.Project = project;

		repositoryMock.findOne
			.mockResolvedValueOnce(task);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const result = await Task.EditTask(null, 'name', 'description', currentUser);

		expect(result).toBeFalsy();
		expect(task.EditBasicValues).not.toBeCalled();
	});

	test('Given name is null, expect false returned', async () => {
		const currentUser = mock<User>();
		currentUser.Id = 'userId';

		const project = mock<Project>();
		project.Id = 'projectId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.Name = 'name';
		task.Description = 'description';
		task.Project = project;

		repositoryMock.findOne
			.mockResolvedValueOnce(task);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const result = await Task.EditTask('taskId', null, 'description', currentUser);

		expect(result).toBeFalsy();
		expect(task.EditBasicValues).not.toBeCalled();
	});

	test('Given task can not be found, expect false returned', async () => {
		const currentUser = mock<User>();
		currentUser.Id = 'userId';

		const project = mock<Project>();
		project.Id = 'projectId';

		const task = mock<Task>();
		task.Id = 'taskId';
		task.Name = 'name';
		task.Description = 'description';
		task.Project = project;

		repositoryMock.findOne
			.mockResolvedValueOnce(null);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const result = await Task.EditTask('taskId', 'name', 'description', currentUser);

		expect(result).toBeFalsy();
		expect(task.EditBasicValues).not.toBeCalled();
	});
});