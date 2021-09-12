import { Column, Entity, getConnection, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { ProjectUser } from "./ProjectUser";
import { Task } from "./Task";
import { User } from "./User";
import { v4 as uuid } from "uuid";
import { UserProjectPermissions, UserProjectRole } from "../constants/UserProjectRole";

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

    public static async EditProject(projectId: string, name: string, description: string, currentUser: User): Promise<boolean> {
        if (!(await ProjectUser.HasPermission(projectId, currentUser.Id, UserProjectPermissions.Update))) {
            return false;
        }

        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);

        const project = await projectRepository.findOne(projectId);

        if (!project) {
            return false;
        }

        project.EditValues(name, description);
        await projectRepository.save(project);

        return true;
    }

    public static async GetAllProjects(currentUser: User): Promise<Project[]> {
        return new Promise(async (resolve) => {
            const connection = getConnection();

            const projectUserRepository = connection.getRepository(ProjectUser);
            const userRepository = connection.getRepository(User);
            const projectRepository = connection.getRepository(Project);

            const projectUsers = await projectUserRepository.find({ relations: ["User", "Project", "Project.CreatedBy"] });
            // const projects = await projectRepository.find({ relations: ["ProjectUsers", "CreatedBy", "ProjectUsers.User"] });

            // const projectsToPush: Project[] = [];
            const projects: Project[] = [];

            projectUsers.forEach((projectUser, index, array) => {
                if (projectUser.User.Id == currentUser.Id) projects.push(projectUser.Project);

                if (index == array.length - 1) resolve(projects);
            });

            // projects.forEach((project, index, array) => {
            //     project.ProjectUsers.forEach((projectUser, index1, array1) => {
            //         if (projectUser.User == user) projectsToPush.push(project);

            //         if (index == array.length - 1 && index1 == array1.length - 1) resolve(projectsToPush);
            //     });
            // });
        });
    }

    public static async CreateProject(name: string, description: string, taskPrefix: string, currentUser: User): Promise<Project> {
        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);
        const projectUserRepository = connection.getRepository(ProjectUser);
        const userRepository = connection.getRepository(User);
        
        const project = new Project(uuid(), name, description, taskPrefix, new Date(), false, currentUser);
        await projectRepository.save(project);

        const projectUser = new ProjectUser(uuid(), UserProjectRole.Admin, project, currentUser);
        await projectUserRepository.save(projectUser);

        return project;
    }

    public static async GetProject(projectId: string, currentUser: User): Promise<Project> {
        if (!(await ProjectUser.HasPermission(projectId, currentUser.Id, UserProjectPermissions.View))) {
            return null;
        }

        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);

        const project = await projectRepository.findOne(projectId, { relations: ["ProjectUsers", "CreatedBy", "ProjectUsers.User"] });

        return project;
    }
}