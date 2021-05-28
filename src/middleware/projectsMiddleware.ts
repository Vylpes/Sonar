import { Request, Response, NextFunction } from "express";
import { Database } from "sqlite3";
import { IProject } from "../models/IProject";
import { IProjectUser } from "../models/IProjectUser";
import { v4 as uuidv4 } from "uuid";
import { UserProjectRole } from "../constants/UserProjectRole";

export class ProjectsMiddleware {
    public GetAllProjectsByUserId(req: Request, res: Response, next: NextFunction) {
        const userId = req.session.userId;

        const db = new Database(process.env.SQLITE3_DB);

        let projects: IProject[] = [];

        db.all(`SELECT * FROM projectUsers WHERE userId = '${userId}'`, (err, projectUsers) => {
            if (err) throw err;

            const projectUserCount = projectUsers.length;

            if (projectUserCount == 0) {
                res.locals.projects = projects;
                next();
                db.close();
            }

            for (let i = 0; i < projectUserCount; i++) {
                const projectUser = projectUsers[i];

                db.all(`SELECT * FROM vwProjects WHERE projectId = '${projectUser.projectId}'`, (err1, projectRows) => {
                    if (err1) throw err1;

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
                            db.close();
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

        const db = new Database(process.env.SQLITE3_DB);

        db.serialize(() => {
            const stmt = db.prepare('INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(projectId, projectName, projectDescription, userId, new Date(), 0);
            stmt.finalize();

            const stmt2 = db.prepare('INSERT INTO projectUsers VALUES (?, ?, ?, ?)');
            stmt2.run(uuidv4(), projectId, userId, UserProjectRole.Admin);
            stmt2.finalize();

            res.locals.projectId = projectId;

            next();
            db.close();
        });
    }

    public GetProjectById(req: Request, res: Response, next: NextFunction) {
        const userId = req.session.userId;
        const projectId = req.params.id;

        const db = new Database(process.env.SQLITE3_DB);

        let project: IProject;

        db.all(`SELECT * FROM vwProjectUsers WHERE projectId = '${projectId}'`, (err, projectUsers) => {
            if (err) throw err;

            const projectUserCount = projectUsers.length;

            if (projectUserCount == 0) {
                req.session.error = "Project not found or you are not authorised to see it";
                res.redirect('/projects/list');
                db.close();
                return;
            }

            for (let i = 0; i < projectUserCount; i++) {
                const projectUser = projectUsers[i];

                if (projectUser.userId == userId) {
                    const role = projectUser.role;

                    db.all(`SELECT * FROM vwProjects WHERE projectId = '${projectId}'`, (err, projects) => {
                        if (err) throw err;

                        if (projects.length != 1) {
                            req.session.error = "Project not found or you are not authorised to see it";
                            res.redirect('/projects/list');
                            db.close();
                            return;
                        }

                        const projectRow = projects[0];

                        project = {
                            projectId: projectRow.id,
                            name: projectRow.name,
                            description: projectRow.description,
                            createdBy: projectRow.createdBy,
                            createdByName: projectRow.createdByName,
                            createdAt: new Date(projectRow.createdAt).toUTCString(),
                            archived: projectRow.archived == 1 ? true : false,
                        };

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
                        db.close();
                        return;
                    });
                } else if (i + 1 == projectUserCount) {
                    req.session.error = "Project not found or you are not authorised to see it";
                    res.redirect('/projects/list');
                    db.close();
                    return;
                }
            }
        });
    }
}