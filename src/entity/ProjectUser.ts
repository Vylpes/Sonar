import { Column, Entity, getConnection, ManyToOne, PrimaryColumn } from "typeorm";
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

        const projectUser = await projectUserRepository.findOne({ Project: project, User: user }, { relations: ["Project", "User"] });

        if (!projectUser) {
            return UserProjectPermissions.None;
        }

        let permissions = UserProjectPermissions.None;

        switch(projectUser.Role) {
            case UserProjectRole.Member:
                permissions |= (
                    UserProjectPermissions.View |
                    UserProjectPermissions.TaskView |
                    UserProjectPermissions.TaskCreate |
                    UserProjectPermissions.TaskUpdate
                );
                break;
            case UserProjectRole.Admin:
                permissions |= (
                    UserProjectPermissions.View |
                    UserProjectPermissions.Update |
                    UserProjectPermissions.Assign |
                    UserProjectPermissions.Promote |
                    UserProjectPermissions.TaskView |
                    UserProjectPermissions.TaskCreate |
                    UserProjectPermissions.TaskUpdate |
                    UserProjectPermissions.TaskDelete
                );
	    case UserProjectRole.Owner:
		permissions |= (
              	    UserProjectPermissions.View |
		    UserProjectPermissions.Update |
		    UserProjectPermissions.Assign |
		    UserProjectPermissions.Promote |
		    UserProjectPermissions.TaskView |
		    UserProjectPermissions.TaskCreate |
		    UserProjectPermissions.TaskUpdate |
		    UserProjectPermissions.TaskDelete
		);
        }

        return permissions;
    }

    public static async GetRole(projectId: string, userId: string): Promise<UserProjectRole> {
        const connection = getConnection();

        const projectRepository = connection.getRepository(Project);
        const projectUserRepository = connection.getRepository(ProjectUser);
        const userRepository = connection.getRepository(User);

        const project = await projectRepository.findOne(projectId);
        const user = await userRepository.findOne(userId);

        if (!project || !user) {
            return null;
        }

        const projectUser = await projectUserRepository.findOne({ Project: project, User: user}, { relations: ["Project", "User"] });

        if (typeof projectUser != "number" && !projectUser) {
            return null;
        }

        return projectUser.Role;
    }

    public static async HasPermission(projectId: string, userId: string, permission: UserProjectPermissions): Promise<boolean> {
        return (await this.GetPermissions(projectId, userId) & permission) == permission;
    }

    public static async AssignUserToProject(projectId: string, userId: string, currentUser: User): Promise<ProjectUser> {
        if (!(await ProjectUser.HasPermission(projectId, currentUser.Id, UserProjectPermissions.Assign))) {
            return null;
        }

        const connection = getConnection();
        
        const projectUserRepository = connection.getRepository(ProjectUser);

        const project = await Project.GetProject(projectId, currentUser);
        const user = await User.GetUser(userId);

        if (!project || !user) {
            return null;
        }

        const projectUser = new ProjectUser(uuid(), UserProjectRole.Member, project, user);
        await projectUserRepository.save(projectUser);

        return projectUser;
    }

    public static async UnassignUserFromProject(projectId: string, userId: string, currentUser: User): Promise<boolean> {
        if (!(await ProjectUser.HasPermission(projectId, currentUser.Id, UserProjectPermissions.Assign))) {
            return false;
        }

        if (userId == currentUser.Id) return false;

        const connection = getConnection();

        const projectUserRepository = connection.getRepository(ProjectUser);

        const project = await Project.GetProject(projectId, currentUser);
        const user = await User.GetUser(userId);

        if (!project || !user) {
            return false;
        }

        const projectUser = await projectUserRepository.findOne({ Project: project, User: user }, { relations: ["Project", "User"] });

	const currentProjectUser = await projectUserRepository.findOne({ Project: project, User: currentUser }, { relations: ["Project", "User"] });

        if (!projectUser || !currentProjectUser) {
            return false;
        }

	if (projectUser.Role == UserProjectRole.Admin && currentProjectUser.Role == UserProjectRole.Admin) {
	    return false;
	}
        
        await projectUserRepository.remove(projectUser);

        return true;
    }

    public static async GetAllUsersNotInProject(projectId: string, currentUser: User): Promise<User[]> {
        return new Promise(async (resolve) => {
            if (!(await ProjectUser.HasPermission(projectId, currentUser.Id, UserProjectPermissions.View))) {
                resolve([]);
                return;
            }

            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const userRepository = connection.getRepository(User);

            const project = await projectRepository.findOne(projectId, { relations: ["ProjectUsers", "ProjectUsers.User"] });

            if (!project) {
                resolve([]);
                return;
            }

            const users = await userRepository.find();

            const usersNotInProject: User[] = [];

            users.forEach((user, index, array) => {
                if (!project.ProjectUsers.find(x => x.User.Id == user.Id)) {
                    usersNotInProject.push(user);
                }

                if (index == array.length - 1) resolve(usersNotInProject);
            });
        });
    }

    public static async ToggleAdmin(projectId: string, userId: string, currentUser: User): Promise<boolean> {
        if (!(await ProjectUser.HasPermission(projectId, currentUser.Id, UserProjectPermissions.Promote))) {
            return false;
        }

        if (userId == currentUser.Id) {
            return false;
        }

        const connection = getConnection();

        const projectUserRepository = connection.getRepository(ProjectUser);

        const project = await Project.GetProject(projectId, currentUser);
        const user = await User.GetUser(userId);

        if (!project || !user) {
            return false;
        }
        
        const projectUser = await projectUserRepository.findOne({ Project: project, User: user }, { relations: ["Project", "User"]});

        if (!projectUser) {
            return false;
        }

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
