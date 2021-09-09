import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { ProjectUser } from "./ProjectUser";
import { Task } from "./Task";
import { User } from "./User";

@Entity()
export class Project {
    constructor(id: string, name: string, description: string, taskPrefix: string, createdAt: Date, archived: boolean, createdBy: User) {
        this.Id = id;
        this.Name = name;
        this.Description = description;
        this.TaskPrefix = taskPrefix;
        this.CreatedAt = createdAt;
        this.Archived = archived;
        this.CreatedBy = createdBy;
    }

    @PrimaryColumn()
    Id: string;

    @Column()
    Name: string;

    @Column()
    Description: string;

    @Column()
    TaskPrefix: string;

    @Column()
    CreatedAt: Date;

    @Column()
    Archived: boolean;

    @ManyToOne(_ => User, user => user.CreatedProjects)
    CreatedBy: User;

    @OneToMany(_ => ProjectUser, projectUser => projectUser.Project)
    ProjectUsers: ProjectUser[];

    @OneToMany(_ => Task, task => task.Project)
    Tasks: Task[];
}