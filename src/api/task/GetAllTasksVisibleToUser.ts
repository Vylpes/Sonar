import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { ProjectUser } from "../../entity/ProjectUser";
import { Task } from "../../entity/Task";
import { User } from "../../entity/User";

export class GetAllTasksVisibleToUser extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        // TODO: Change to of current user
        super.router.get('/task/GetAllTasksVisibleToUser/:userId', (req: Request, res: Response) => {
            const connection = getConnection();

            const projectUserRepository = connection.getRepository(ProjectUser);
            const taskRepository = connection.getRepository(Task);
            const userRepository = connection.getRepository(User);

            const tasksVisibleToUser: Task[] = [];

            userRepository.findOne({ Id: req.params.userId }).then(user => {
                projectUserRepository.find({ User: user }).then(projectUsers => {
                    projectUsers.forEach(projectUser => {
                        taskRepository.find({ Project: projectUser.Project }).then(tasks => {
                            tasks.forEach(task => {
                                tasksVisibleToUser.push(task);
                            });
                        }).catch(e => {
                            throw new Error(e);
                        });
                    });

                    res.json(tasksVisibleToUser);
                }).catch(e => {
                    throw new Error(e);
                });
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}