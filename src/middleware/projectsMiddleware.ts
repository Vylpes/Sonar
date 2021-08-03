import { Request, Response, NextFunction } from "express";
import { IProject } from "../models/IProject";
import { IProjectUser } from "../models/IProjectUser";
import { v4 as uuidv4 } from "uuid";
import { UserProjectRole } from "../constants/UserProjectRole";
import { createConnection, RowDataPacket, QueryError } from "mysql2";
import { IUser } from "../models/IUser";

export class ProjectsMiddleware {
    public GetAllProjectsByUserId(req: Request, res: Response, next: NextFunction) {
        const userId = req.session.userId;
        
        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        let projects: IProject[] = [];

        connection.execute('SELECT * FROM projectUsers WHERE userId = ?', [ userId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
            if (err) throw err;

            const projectUserCount = projectUsers.length;

            if (projectUserCount == 0) {
                res.locals.projects = projects;
                next();
                connection.end();
                return;
            }

            for (let i = 0; i < projectUserCount; i++) {
                const projectUser = projectUsers[i];

                connection.execute('SELECT * FROM vwProjects WHERE projectId = ?', [ projectUser.projectId ], (err: QueryError, projectRows: RowDataPacket[]) => {
                    if (err) throw err;

                    if (projectRows.length > 0) {
                        const projectRow = projectRows[0];

                        const project: IProject = {
                            projectId: projectRow.projectId,
                            name: projectRow.name,
                            description: projectRow.description,
                            taskPrefix: projectRow.taskPrefix,
                            createdBy: projectRow.createdBy,
                            createdByName: projectRow.createdByName,
                            createdAt: new Date(projectRow.createdAt).toUTCString(),
                            archived: projectRow.archived == 1 ? true : false,
                        }

                        projects.push(project);

                        if (i + 1 == projectUserCount) {
                            res.locals.projects = projects;
                            next();

                            connection.end();
                            return;
                        }
                    }
                });
            }
        });
    }

    public CreateProject(req: Request, res: Response, next: NextFunction) {
        const projectName = req.body.name;
        const projectDescription = req.body.description;
        const projectTaskPrefix = req.body.taskPrefix;

        if (!projectName || !projectDescription || !projectTaskPrefix) {
            req.session.error = "All fields are required";
            res.redirect('/projects/list');
            return;
        }

        const userId = req.session.userId;
        const projectId = uuidv4();

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        connection.execute('INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?)', [
            projectId,
            projectName,
            projectDescription,
            projectTaskPrefix,
            userId,
            new Date(),
            0,
        ]);

        connection.execute('INSERT INTO projectUsers VALUES (?, ?, ?, ?)', [
            uuidv4(),
            projectId,
            userId,
            UserProjectRole.Admin
        ]);

        res.locals.projectId = projectId;

        next();
        connection.end();
        return;
    }

    public GetProjectById(req: Request, res: Response, next: NextFunction) {
        const userId = req.session.userId;
        const projectId = req.params.id;

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        let project: IProject;

        connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ? AND userId = ?', [ projectId, userId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
            if (err) throw err;

            let projectUserCount = projectUsers.length;

            if (projectUserCount == 0) {
                req.session.error = "Project not found or you are not authorised to see it";
                res.redirect('/projects/list');

                connection.end();
                return;
            }

            const projectUser = projectUsers[0];
            const role = projectUser.role;

            connection.execute('SELECT * FROM vwProjects WHERE projectId = ?', [ projectId ], (err: QueryError, projects: RowDataPacket[]) => {
                if (err) throw err;

                if (projects.length != 1) {
                    req.session.error = 'Project not found or you are not authorised to see it';
                    res.redirect('/projects/list');
                    connection.end();
                    return;
                }

                connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ?', [ projectId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
                    if (err) throw err;

                    const projectRow = projects[0];

                    projectUserCount = projectUsers.length;

                    project = {
                        projectId: projectRow.projectId,
                        name: projectRow.name,
                        description: projectRow.description,
                        taskPrefix: projectRow.taskPrefix,
                        createdBy: projectRow.createdBy,
                        createdByName: projectRow.createdByName,
                        createdAt: new Date(projectRow.createdAt).toUTCString(),
                        archived: projectRow.archived == 1 ? true : false,
                    }

                    let projectUsersList: IProjectUser[] = [];

                    for (let j = 0; j < projectUserCount; j++) {
                        const projectUser = projectUsers[j];

                        projectUsersList.push({
                            projectUserId: projectUser.projectUserId,
                            projectId: projectUser.projectId,
                            userId: projectUser.userId,
                            userName: projectUser.userName,
                            role: projectUser.role,
                            isAdmin: projectUser.role == UserProjectRole.Admin ? true : false,
                        });
                    }

                    res.locals.project = project;
                    res.locals.projectUsers = projectUsersList;
                    res.locals.userProjectRole = role;

                    next();
                    connection.end();
                    return;
                });
            });
        });
    }

    public GetUsersNotInProject(req: Request, res: Response, next: NextFunction) {
        const projectId = req.params.id;

        if (!projectId) {
            req.session.error = "Project id not given";
            res.redirect('/projects/list');

            return;
        }

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        let users: IUser[] = [];

        connection.execute('SELECT * FROM users', (err: QueryError, userRows: RowDataPacket[]) => {
            if (err) throw err;

            const userCount = userRows.length;

            if (userCount == 0) {
                res.locals.users = [];

                next();
                connection.end();
                return;
            }

            for (let i = 0; i < userCount; i++) {
                const user = userRows[i];

                connection.execute('SELECT * FROM vwProjectUsers WHERE userId = ? AND projectId = ?', [ user.id, projectId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
                    if (err) throw err;

                    // If the query finds no user for the projectId in the vwProjectUsers view
                    if (projectUsers.length == 0) {
                        const userModel: IUser = {
                            userId: user.id,
                            email: user.email,
                            username: user.username,
                            verified: user.verified == 1 ? true : false,
                            admin: user.admin == 1 ? true : false,
                            active: user.active == 1 ? true : false,
                        }

                        users.push(userModel);
                    }

                    if (i + 1 == userCount) {
                        res.locals.users = users;

                        next();
                        connection.end();
                        return;
                    }
                });
            }
        });
    }

    public AssignUserToProject(req: Request, res: Response, next: NextFunction) {
        const projectId = req.params.id;
        const userId = req.params.userid;

        if (!projectId || !userId) {
            req.session.error = "All fields are required";
            res.redirect('/projects/list');
            return;
        }

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        connection.execute('SELECT * FROM vwProjects WHERE projectId = ?', [ projectId ], (err: QueryError, projects: RowDataPacket[]) => {
            if (err) throw err;

            // If project doesn't exist
            if (projects.length == 0) {
                req.session.error = "Project does not exist";
                res.redirect("/projects/list");

                connection.end();
                return;
            }

            connection.execute('SELECT * FROM users WHERE id = ?', [ userId ], (err: QueryError, users: RowDataPacket[]) => {
                if (err) throw err;

                if (users.length == 0) {
                    req.session.error = "User does not exist";
                    res.redirect("/projects/view/" + projectId);

                    connection.end();
                    return;
                }

                connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ? AND userId = ?', [ projectId, userId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
                    if (err) throw err;
        
                    // If user is already assigned to project
                    if (projectUsers.length != 0) {
                        req.session.error = "User is already assigned";
                        res.redirect("/projects/view/" + projectId);
        
                        connection.end();
                        return;
                    }

                    connection.execute('SELECT * FROM vwProjectUsers WHERE userId = ? AND projectId = ?', [ req.session.userId, projectId ], (err: QueryError, user: RowDataPacket[]) => {
                        if (err) throw err;

                        if (user.length == 0) {
                            req.session.error = "Current user does not exist in project";
                            res.redirect("/");

                            connection.end();
                            return;
                        }

                        const userRole = user[0].role;
                      
                        if (userRole != UserProjectRole.Admin) {
                            req.session.error = "You are not authorised to assign users to this project";
                            res.redirect("/projects/view/" + projectId);

                            connection.end();
                            return;
                        }

                        connection.execute('INSERT INTO projectUsers VALUES (?, ?, ?, ?)', [
                            uuidv4(),
                            projectId,
                            userId,
                            UserProjectRole.Member,
                        ], (err: QueryError) => {
                            if (err) throw err;

                            next();

                            connection.end();
                            return;
                        });
                    });
                });
            });
        });
    }

    public UnassignUserFromProject(req: Request, res: Response, next: NextFunction) {
        const projectId = req.params.id;
        const userId = req.params.userid;
        const currentUserId = req.session.userId;

        if (!projectId || !userId) {
            req.session.error = "All fields are required";
            res.redirect('/projects/list');
            return;
        }

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        connection.execute('SELECT * FROM vwProjects WHERE projectId = ?', [ projectId ], (err: QueryError, projects: RowDataPacket[]) => {
            if (err) throw err;

            if (projects.length == 0) {
                req.session.error = "Project does not exist";
                res.redirect('/projects/list');

                connection.end();
                return;
            }

            connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ? AND userId = ?', [ projectId, userId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
                if (err) throw err;

                if (projectUsers.length == 0) {
                    req.session.error = "User is not assigned to project";
                    res.redirect('/projects/view/' + projectId);

                    connection.end();
                    return;
                }

                const projectUser = projectUsers[0];

                if (projectUser.userId == currentUserId) {
                    req.session.error = "You can not unassign yourself";
                    res.redirect('/projects/view/' + projectId);

                    connection.end();
                    return;
                }

                connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ? AND userId = ?', [ projectId, currentUserId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
                    if (err) throw err;

                    if (projectUsers.length == 0) {
                        req.session.error = "You are not authorised to unassign a user from this project";
                        res.redirect('/projects/view/' + projectId);

                        connection.end();
                        return;
                    }

                    if (projectUsers[0].role != UserProjectRole.Admin) {
                        req.session.error = "You are not authorised to unassign a user from this project";
                        res.redirect('/projects/view/' + projectId);

                        connection.end();
                        return;
                    }

                    connection.execute('DELETE FROM projectUsers WHERE projectId = ? AND userId = ?', [ projectId, userId ], (err: QueryError) => {
                        if (err) throw err;

                        next();
                        connection.end();
                        return;
                    });
                });
            });
        });
    }

    public ToggleAdmin(req: Request, res: Response, next: NextFunction) {
        const projectId = req.params.projectid;
        const userId = req.params.userid;

        if (!projectId || !userId) {
            req.session.error = "All fields are required";
            res.redirect('/projects/list');
            return;
        }

        const currentUserId = req.session.userId;

        if (userId == currentUserId ) {
            req.session.error = "Cannot toggle yourself!";
            res.redirect('/projects/list');
            return;
        }

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ? AND userId = ?', [ projectId, currentUserId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
            if (err) throw err;

            if (projectUsers.length == 0) {
                req.session.error = "Project not found or you are not authorised to see it";
                res.redirect('/projects/list');

                connection.end();
                return;
            }

            const projectUser = projectUsers[0];
            const role = projectUser.role;

            if (role != UserProjectRole.Admin) {
                req.session.error = "Unauthorised";
                res.redirect('/projects/view/' + projectId);

                connection.end();
                return;
            }

            connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ? AND userId = ?', [ projectId, userId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
                if (err) throw err;

                if (projectUsers.length == 0) {
                    req.session.error = "User requested is not part of the project";
                    res.redirect('/projects/view/' + projectId);

                    connection.end();
                    return;
                }

                let projectUserToChange = projectUsers[0];
                let roleToChange = projectUserToChange.role;

                switch (roleToChange) {
                    case UserProjectRole.Member:
                        roleToChange = UserProjectRole.Admin;
                        break;
                    case UserProjectRole.Admin:
                        roleToChange = UserProjectRole.Member;
                        break;
                    default:
                        roleToChange = roleToChange;
                        break;
                }

                connection.execute('UPDATE projectUsers SET role = ? WHERE projectId = ? AND userId = ?', [ roleToChange, projectUserToChange.projectId, projectUserToChange.userId ], (err: QueryError) => {
                    if (err) throw err;

                    next();
                    connection.end();
                    return;
                });
            });
        });
    }

    public EditProject(req: Request, res: Response, next: NextFunction) {
        const projectId = req.body.projectId;
        const projectName = req.body.name;
        const projectDescription = req.body.description;

        const userId = req.session.userId;

        if (!projectId) {
            req.session.error = "Project does not exist or you are not authorised to see it";
            res.redirect('/projects/list');
            return;
        }
        
        if (!projectName || !projectDescription) {
            req.session.error = "All fields are required";
            res.redirect(`/projects/view/${projectId}`);
            return;
        }

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ? AND userId = ?', [ projectId, userId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
            if (err) throw err;

            if (projectUsers.length != 1) {
                req.session.error = "Project does not exist or you are not authorised to see it";
                res.redirect('/projects/list');

                connection.end();
                return;
            }

            connection.execute('UPDATE projects SET name = ?, description = ? WHERE id = ?', [ projectName, projectDescription, projectId ], (err: QueryError) => {
                if (err) throw err;

                res.locals.projectId = projectId;

                connection.end();
                next();
                return;
            });
        });
    }
}
