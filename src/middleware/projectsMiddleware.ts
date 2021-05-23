import { Request, Response, NextFunction } from "express";
import { Database } from "sqlite3";
import { IProject } from "../models/IProject";

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
                            createdAt: projectRow.createdAt,
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
}