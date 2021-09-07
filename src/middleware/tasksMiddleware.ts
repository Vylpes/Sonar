import { Request, Response, NextFunction } from "express";
import { ITask } from "../models/ITask";
import { IProjectUser } from "../models/IProjectUser";
import { v4 as uuidv4 } from "uuid";
import { createConnection, RowDataPacket, QueryError } from "mysql2";

export class TasksMiddleware {
    public GetAllTasksVisibleToUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.session.userId;

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        let tasks: ITask[] = [];
        
        connection.execute('SELECT * FROM vwProjectUsers WHERE userId = ?', [ userId ], (err: QueryError, projectUsers: RowDataPacket[]) => {
            if (err) throw err;

            if (projectUsers.length == 0) {
                res.locals.tasks = tasks;
                next();
                connection.end();
                return;
            }

            for (let i = 0; i < projectUsers.length; i++) {
                const projectUser = projectUsers[i];

                connection.execute('SELECT * FROM vwTasks WHERE projectId = ?', [ projectUser.projectId ], (err: QueryError, taskRows: RowDataPacket[]) => {
                    if (err) throw err;

                    if (taskRows.length == 0) {
                        res.locals.tasks = tasks;
                        next();
                        connection.end();
                        return;
                    }

                    for (let j = 0; j < taskRows.length; j++) {
                        const taskRow = taskRows[j];

                        const task: ITask = {
                            taskId: taskRow.id,
                            taskNumber: taskRow.taskNumber,
                            name: taskRow.name,
                            description: taskRow.description,
                            createdBy: taskRow.createdBy,
                            assignedTo: taskRow.assignedTo,
                            createdAt: new Date(taskRow.createdAt).toUTCString(),
                            parentTask: taskRow.parentTask,
                            status: taskRow.status,
                            archived: taskRow.archived == 1 ? true : false,
                            createdByUsername: taskRow.createdByUsername,
                            assignedToUsername: taskRow.assignedToUsername,
                            projectName: taskRow.projectName,
                            parentTaskName: taskRow.parentTaskName,
                        }

                        tasks.push(task);

                        if (i + 1 == projectUsers.length && j + 1 == taskRows.length) {
                            res.locals.tasks = tasks;
                            next();
                            connection.end();
                            return;
                        }
                    }
                });
            }
        });
    }
}
