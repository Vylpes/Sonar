import { Request, Response, NextFunction } from "express";
import { IProject } from "../models/IProject";
import { IProjectUser } from "../models/IProjectUser";
import { v4 as uuidv4 } from "uuid";
import { UserProjectRole } from "../constants/UserProjectRole";
import { createConnection, RowDataPacket, QueryError } from "mysql2";

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

        if (!projectName || !projectDescription) {
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

        connection.execute('INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?)', [
            projectId,
            projectName,
            projectDescription,
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

        connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ?', [ projectId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
            if (err) throw err;

            const projectUserCount = projectUsers.length;

            if (projectUserCount == 0) {
                req.session.error = "Project not found or you are not authorised to see it";
                res.redirect('/projects/list');

                connection.end();
                return;
            }

            for (let i = 0; i < projectUserCount; i++) {
                const projectUser = projectUsers[i];

                if (projectUser.userId == userId) {
                    const role = projectUser.role;

                    connection.execute('SELECT * FROM vwProjects WHERE projectId = ?', [ projectId ], (err: QueryError, projects: RowDataPacket[]) => {
                        if (err) throw err;

                        if (projects.length != 1) {
                            req.session.error = 'Project not found or you are not authorised to see it';
                            res.redirect('/projects/list');
                            connection.end();
                            return;
                        }

                        const projectRow = projects[0];

                        project = {
                            projectId: projectRow.projectId,
                            name: projectRow.name,
                            description: projectRow.description,
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
                            });
                        }

                        res.locals.project = project;
                        res.locals.projectUsers = projectUsersList;
                        res.locals.userProjectRole = role;

                        next();
                        connection.end();
                        return;
                    });
                } else if (i + 1 == projectUserCount) {
                    req.session.error = "Project not found or you are not authorised to see it";
                    res.redirect('/projects/list');
                    connection.end();
                    return;
                }
            }
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
