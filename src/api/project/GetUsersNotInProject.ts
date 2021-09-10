import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { User } from "../../entity/User";

export class GetUsersNotInProject extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        // TODO: Require Authorisation
        // TOOD: Only if user is a member
        super.router.get('/project/GetUsersNotInProject/:projectId', (req: Request, res: Response) => {
            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const userRepository = connection.getRepository(User);

            let usersNotInProject: User[] = [];

            projectRepository.findOne({ Id: req.params.projectId }).then(project => {
                userRepository.find().then(users => {
                    users.forEach(user => {
                        if (!project.ProjectUsers.find(x => x.User.Id = user.Id)) {
                            usersNotInProject.push(user);
                        }
                    });

                    res.json(usersNotInProject);
                }).catch(e => {
                    throw new Error(e);
                });
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}