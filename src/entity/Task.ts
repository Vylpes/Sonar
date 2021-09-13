import { Column, Entity, getConnection, ManyToOne, PrimaryColumn } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";

@Entity()
export class Task {
    constructor(id: string, taskNumber: number, name: string, description: string, createdBy: User, createdAt: Date, status: number, archived: boolean, project: Project, assignedTo?: User, parentTask?: Task) {
        this.Id = id;
        this.TaskNumber = taskNumber;
        this.Name = name;
        this.Description = description;
        this.CreatedBy = createdBy;
        this.AssignedTo = assignedTo;
        this.CreatedAt = createdAt;
        this.ParentTask = parentTask;
        this.Status = status;
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
    Status: number;

    @Column()
    Archived: boolean;
    
    @ManyToOne(_ => User, user => user.CreatedTasks)
    CreatedBy: User;

    @ManyToOne(_ => User, user => user.AssignedTasks)
    AssignedTo: User;

    @ManyToOne(_ => Task, task => task.ChildTasks)
    ParentTask: Task;

    @ManyToOne(_ => Project, project => project.Tasks)
    Project: Project;

    @ManyToOne(_ => Task, task => task.ParentTask)
    ChildTasks: Task[];

    public static async GetAllTasks(currentUser: User): Promise<Task[]> {
        return new Promise(async (resolve) => {
            const projects = await Project.GetAllProjects(currentUser);

            const tasks: Task[] = [];

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
}