import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
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
}