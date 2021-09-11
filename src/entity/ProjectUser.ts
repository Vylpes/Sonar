import { Column, Entity, getConnection, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { UserProjectPermissions, UserProjectRole } from "../constants/UserProjectRole";
import { Project } from "./Project";
import { User } from "./User";
import { v4 as uuid } from "uuid";

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

    public UpdateRole(role: number) {
        this.Role = role;
    }

    public static async GetPermissions(projectId: string, userId: string): Promise<UserProjectPermissions> {
        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);
        const projectUserRepository = connection.getRepository(ProjectUser);
        const userRepository = connection.getRepository(User);

        const project = await projectRepository.findOne(projectId);
        const user = await userRepository.findOne(userId);

        if (!project || !user) {
            return UserProjectPermissions.None;
        }

        const projectUser = await projectUserRepository.findOne({ Project: project, User: user});

        if (!projectUser) {
            return UserProjectPermissions.None;
        }

        let permissions = UserProjectPermissions.None;

        switch(projectUser.Role) {
            case UserProjectRole.Member:
                permissions |= UserProjectPermissions.View;
                break;
            case UserProjectRole.Admin:
                permissions |= UserProjectPermissions.View | UserProjectPermissions.Update | UserProjectPermissions.Assign | UserProjectPermissions.Promote;
        }

        return permissions;
    }

    public static async HasPermission(projectId: string, userId: string, permission: UserProjectPermissions): Promise<boolean> {
        return (await this.GetPermissions(projectId, userId) & permission) == permission;
    }

    public static async AssignUserToProject(projectId: string, userId: string, currentUserId: string): Promise<ProjectUser> {
        if (!this.HasPermission(projectId, currentUserId, UserProjectPermissions.Assign)) {
            return null;
        }

        const connection = getConnection();
        
        const projectUserRepository = connection.getRepository(ProjectUser);

        const project = await Project.GetProject(projectId, currentUserId);
        const user = await User.GetUser(userId);

        const projectUser = new ProjectUser(uuid(), UserProjectRole.Member, project, user);
        await projectUserRepository.save(projectUser);

        return projectUser;
    }

    public static async UnassignUserFromProject(projectId: string, userId: string, currentUserId: string): Promise<boolean> {
        if (!this.HasPermission(projectId, currentUserId, UserProjectPermissions.Assign)) {
            return false;
        }

        const connection = getConnection();

        const projectUserRepository = connection.getRepository(ProjectUser);

        const project = await Project.GetProject(projectId, currentUserId);
        const user = await User.GetUser(userId);

        const projectUser = await projectUserRepository.findOne({ Project: project, User: user });
        
        await projectUserRepository.remove(projectUser);

        return true;
    }

    public static async GetAllUsersNotInProject(projectId: string, currentUserId: string): Promise<User[]> {
        if (!ProjectUser.HasPermission(projectId, currentUserId, UserProjectPermissions.View)) {
            return [];
        }

        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);
        const userRepository = connection.getRepository(User);

        const project = await projectRepository.findOne(projectId);

        if (!project) {
            return [];
        }

        const users = await userRepository.find();

        users.forEach(user => {
            if (project.ProjectUsers.find(x => x.User == user)) {
                users.splice(users.indexOf(user));
            }
        });

        return users;
    }

    public static async ToggleAdmin(projectId: string, userId: string, currentUserId: string): Promise<boolean> {
        if (!ProjectUser.HasPermission(projectId, currentUserId, UserProjectPermissions.Promote)) {
            return false;
        }

        const connection = getConnection();

        const projectUserRepository = connection.getRepository(ProjectUser);

        const project = await Project.GetProject(projectId, currentUserId);
        const user = await User.GetUser(userId);

        // TODO: ProjectUser.GetProjectUser();
        const projectUser = await projectUserRepository.findOne({ Project: project, User: user });

        let newRole: number;

        switch(projectUser.Role) {
            case UserProjectRole.Member:
                newRole = UserProjectRole.Admin;
                break;
            case UserProjectRole.Admin:
                newRole = UserProjectRole.Member;
                break;
        }

        projectUser.UpdateRole(newRole);
        await projectUserRepository.save(projectUser);

        return true;
    }
}