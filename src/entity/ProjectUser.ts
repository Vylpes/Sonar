import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";

@Entity()
export class ProjectUser {
    constructor(id: string, role: number, project: Project, user: User) {
        this.Id = id;
        this.Role = role;
        this.Project = project;
        this.User = user;
    }

    @PrimaryColumn()
    Id: string;

    @Column()
    Role: number;
    
    @ManyToOne(_ => Project, project => project.ProjectUsers)
    Project: Project;

    @ManyToOne(_ => User, user => user.AssignedProjects)
    User: User;

    public ToggleAdmin() {
        if (this.Role == 0) this.Role = 1;
        if (this.Role == 1) this.Role = 0;
    }
}