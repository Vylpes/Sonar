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

    public static async GetAllTasks(currentUser: User): Promise<Task[]> {
        return new Promise(async (resolve) => {
            const projects = await Project.GetAllProjects(currentUser);

            const tasks: Task[] = [];

            if (projects.length == 0) resolve(tasks);

            projects.forEach((project, index, array) => {
                let lastItem = index == array.length - 1;

                if (lastItem && project.Tasks.length == 0) {
                    resolve(tasks);
                }

                project.Tasks.forEach((task, index, array) => {
                    tasks.push(task);

                    lastItem = lastItem && index == array.length - 1;

                    if (lastItem) resolve(tasks);
                })
            });
        });
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

        const task = new Task(uuid(), taskNumber, name, description, createdBy, new Date(), false, false,project, assignedTo, parentTask);

        await taskRepository.save(task);

        return task;
    }
}