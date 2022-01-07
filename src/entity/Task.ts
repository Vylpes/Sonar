import { Column, Entity, getConnection, ManyToOne, PrimaryColumn } from "typeorm";
import { UserProjectPermissions } from "../constants/UserProjectRole";
import { Project } from "./Project";
import { ProjectUser } from "./ProjectUser";
import { User } from "./User";
import { v4 as uuid } from "uuid";

@Entity()
export class Task {
    constructor(id: string, taskNumber: number, name: string, description: string, createdBy: User, createdAt: Date, done: boolean, archived: boolean, project: Project, assignedTo?: User, parentTask?: Task) {
        this.Id = id;
        this.TaskNumber = taskNumber;
        this.Name = name;
        this.Description = description;
        this.CreatedBy = createdBy;
        this.AssignedTo = assignedTo;
        this.CreatedAt = createdAt;
        this.ParentTask = parentTask;
        this.Done = done;
        this.Archived = archived;
        this.Project = project;
    }
    
    @PrimaryColumn()
    Id: string;

    @Column()
    TaskNumber: number;

    @Column()
    Name: string;

    @Column()
    Description: string;

    @Column()
    CreatedAt: Date;

    @Column()
    Done: boolean;

    @Column()
    Archived: boolean;
    
    @ManyToOne(_ => User, user => user.CreatedTasks)
    CreatedBy: User;

    @ManyToOne(_ => User, user => user.AssignedTasks)
    AssignedTo?: User;

    @ManyToOne(_ => Task, task => task.ChildTasks)
    ParentTask?: Task;

    @ManyToOne(_ => Project, project => project.Tasks)
    Project: Project;

    @ManyToOne(_ => Task, task => task.ParentTask)
    ChildTasks: Task[];

    public EditBasicValues(name: string, description: string) {
        this.Name = name;
        this.Description = description;
    }

    public AssignUser(user: User) {
        this.AssignedTo = user;
    }

    public UnassignUser() {
        this.AssignedTo = null;
    }

    public ToggleDoneStatus() {
        this.Done = !this.Done;
    }

    public ToggleArchiveStatus() {
	this.Archived = !this.Archived;
    }

    public static async GetAllTasks(currentUser: User): Promise<Task[]> {
        const connection = getConnection();
        
        const userRepository = connection.getRepository(User);

        const user = await userRepository.findOne(currentUser.Id,
            { relations: [
                "AssignedProjects",
                "AssignedProjects.Project", 
                "AssignedProjects.Project.Tasks",
                "AssignedProjects.Project.Tasks.AssignedTo",
                "AssignedProjects.Project.Tasks.Project",
            ],
        });
        
        let projects = user.AssignedProjects.map(x => x.Project);
        let tasks = projects.flatMap(x => x.Tasks);

        return tasks;
    }

    public static async GetAssignedTasks(userId: string): Promise<Task[]> {
        const connection = getConnection();
        
        const userRepository = connection.getRepository(User);

        const user = await userRepository.findOne(userId, { relations: [ "AssignedTasks" ]});

        if (!user) {
            return null;
        }
        
        return user.AssignedTasks;
    }

    public static async CreateTask(name: string, description: string, createdBy: User, project: Project, assignedTo?: User, parentTask?: Task): Promise<Task> {
        if (!(await ProjectUser.HasPermission(project.Id, createdBy.Id, UserProjectPermissions.TaskCreate))) {
            return null;
        }

        const connection = getConnection();

        const taskRepository = connection.getRepository(Task);

        const taskNumber = await Project.GetNextTask(project.Id, createdBy);

        const task = new Task(uuid(), taskNumber, name, description, createdBy, new Date(), false, false, project, assignedTo, parentTask);

        await taskRepository.save(task);

        return task;
    }

    public static async GetTaskByTaskString(taskString: string, currentUser: User): Promise<Task> {
        const taskPrefix = taskString.split('-')[0];
        const taskNumber = taskString.split('-')[1];

        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);

        const project = await projectRepository.findOne({ TaskPrefix: taskPrefix }, {
            relations: [
                "Tasks",
                "Tasks.Project",
                "Tasks.Project.ProjectUsers",
                "Tasks.Project.ProjectUsers.User",
                "Tasks.CreatedBy",
                "Tasks.AssignedTo",
            ]
        });

        if (!project) {
            return null;
        }

        if (!(await ProjectUser.HasPermission(project.Id, currentUser.Id, UserProjectPermissions.TaskView))) {
            return null;
        }

        const task = project.Tasks.find(x => x.TaskNumber == Number.parseInt(taskNumber));

        return task;
    }

    public static async EditTask(taskString: string, name: string, description: string, currentUser: User): Promise<Boolean> {
        if (!taskString || !name) {
            return false;
        }

        const connection = getConnection();

        const taskRepository = connection.getRepository(Task);

        const task = await Task.GetTaskByTaskString(taskString, currentUser);

        if (!task) {
            return false;
        }

        if (!(await ProjectUser.HasPermission(task.Project.Id, currentUser.Id, UserProjectPermissions.TaskUpdate))) {
            return false;
        }

        task.EditBasicValues(name, description);

        await taskRepository.save(task);

        return true;
    }

    public static async AssignUserToTask(taskString: string, user: User, currentUser: User): Promise<Boolean> {
        const connection = getConnection();

        const taskRepository = connection.getRepository(Task);

        const task = await Task.GetTaskByTaskString(taskString, currentUser);

        if (!task) {
            return false;
        }

        if (!(await ProjectUser.HasPermission(task.Project.Id, currentUser.Id, UserProjectPermissions.TaskAssign))) {
            return false;
        }

        task.AssignUser(user);

        await taskRepository.save(task);

        return true;
    }

    public static async UnassignUserFromTask(taskString: string, currentUser: User): Promise<Boolean> {
        const connection = getConnection();

        const taskRepository = connection.getRepository(Task);

        const task = await Task.GetTaskByTaskString(taskString, currentUser);

        if (!task) {
            return false;
        }

        if (!task.AssignedTo) {
            return false;
        }

        if (!(await ProjectUser.HasPermission(task.Project.Id, currentUser.Id, UserProjectPermissions.TaskAssign))) {
            return false;
        }

        task.UnassignUser();

        await taskRepository.save(task);

        return true;
    }

    public static async ToggleTaskCompleteStatus(taskString: string, currentUser: User): Promise<Boolean> {
        const connection = getConnection();

        const taskRepo = connection.getRepository(Task);

        const task = await Task.GetTaskByTaskString(taskString, currentUser);

        if (!task) {
            return false;
        }

        if (!(await ProjectUser.HasPermission(task.Project.Id, currentUser.Id, UserProjectPermissions.TaskUpdate))) {
            return false;
        };

        task.ToggleDoneStatus();

        await taskRepo.save(task);

        return true;
    }

    public static async ToggleTaskArchiveStatus(taskString: string, currentUser: User): Promise<Boolean> {
	const connection = getConnection();

	const taskRepo = connection.getRepository(Task);

	const task = await Task.GetTaskByTaskString(taskString, currentUser);

	if (!task) {
	    return false;
	}

	if (!(await ProjectUser.HasPermission(task.Project.Id, currentUser.Id, UserProjectPermissions.TaskUpdate))) {
	    return false;
	}

	task.ToggleArchiveStatus();

	await taskRepo.save(task);

	return true;
    }
}
