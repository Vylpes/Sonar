import {Entity, Column, PrimaryColumn, OneToMany} from "typeorm";
import { Project } from "./Project";
import { ProjectUser } from "./ProjectUser";
import { Task } from "./Task";

@Entity()
export class User {
    constructor(id: string, email: string, username: string, password: string, verified: boolean, admin: boolean, active: boolean) {
        this.Id = id;
        this.Email = email;
        this.Username = username;
        this.Password = password;
        this.Verified = verified;
        this.Admin = admin;
        this.Active = active;
    }

    @PrimaryColumn()
    Id: string;

    @Column()
    Email: string;

    @Column()
    Username: string;

    @Column()
    Password: string;

    @Column()
    Verified: boolean;

    @Column()
    Admin: boolean;

    @Column()
    Active: boolean;

    @OneToMany(_ => Project, project => project.CreatedBy)
    CreatedProjects: Project[];

    @OneToMany(_ => ProjectUser, projectUser => projectUser.User)
    AssignedProjects: ProjectUser[];

    @OneToMany(_ => Task, task => task.CreatedBy)
    CreatedTasks: Task[];

    @OneToMany(_ => Task, task => task.AssignedTo)
    AssignedTasks: Task[];
}
