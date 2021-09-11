import { Column, Entity, getConnection, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { ProjectUser } from "./ProjectUser";
import { Task } from "./Task";
import { User } from "./User";
import { v4 as uuid } from "uuid";
import { UserProjectRole } from "../constants/UserProjectRole";

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

    public EditValues(name: string, description: string) {
        this.Name = name;
        this.Description = description;
    }

    public static async EditProject(projectId: string, name: string, description: string, currentUserId: string): Promise<boolean> {
        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);

        const project = await projectRepository.findOne(projectId);

        if (!project) {
            return false;
        }
        
        if (!project.ProjectUsers.find(x => x.User.Id == currentUserId)) {
            return false;
        }

        project.EditValues(name, description);
        await projectRepository.save(project);

        return true;
    }

    public static async GetAllProjects(currentUserId: string): Promise<Project[]> {
        const connection = getConnection();

        const projectUserRepository = connection.getRepository(ProjectUser);
        const userRepository = connection.getRepository(User);

        const user = await userRepository.findOne(currentUserId);

        if (!user) {
            return [];
        }

        const projectUsers = await projectUserRepository.find({ User: user });
        
        return projectUsers.map(x => x.Project);
    }

    public static async CreateProject(name: string, description: string, taskPrefix: string, currentUserId: string): Promise<Project> {
        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);
        const projectUserRepository = connection.getRepository(ProjectUser);
        const userRepository = connection.getRepository(User);

        const user = await userRepository.findOne(currentUserId);
        
        const project = new Project(uuid(), name, description, taskPrefix, new Date(), false, user);
        await projectRepository.save(project);

        const projectUser = new ProjectUser(uuid(), UserProjectRole.Admin, project, user);
        await projectUserRepository.save(projectUser);

        return project;
    }

    public static async GetProject(projectId: string, currentUserId: string): Promise<Project> {
        const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const userRepository = connection.getRepository(User);

            const project = await projectRepository.findOne(projectId);

            if (!project) {
                return null;
            }

            const user = await userRepository.findOne(currentUserId);
            const projectUser = project.ProjectUsers.find(x => x.User == user && x.Project == project);

            if (!projectUser) {
                return null;
            }

            return project;
    }
}