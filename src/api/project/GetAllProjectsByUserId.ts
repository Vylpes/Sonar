import { Request, Response, Router } from "express";
import { Connection, getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { User } from "../../entity/User";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class GetAllProjectsByUserId extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router) {
        super(router);
        this._userMiddleware = new UserMiddleware();
    }

    public OnGet() {
        // TODO: Require Authorisation
        // TODO: Change to only get current user
        super.router.get('/project/getAllProjectsByUserId/:userId', (req: Request, res: Response) => {
            const connection = getConnection();

            const userRepository = connection.getRepository(User);

            userRepository.findOne({ Id: req.params.userId }).then(async user => {
                const projectUserRepository = connection.getRepository(ProjectUser);

                await projectUserRepository.find({ User: user}).then(projectUsers => {
                    let projects: Project[] = [];

                    for(let user of projectUsers) {
                        projects.push(user.Project);
                    }

                    res.json(projects);
                }).catch(e => {
                    throw new Error(e);
                });
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}