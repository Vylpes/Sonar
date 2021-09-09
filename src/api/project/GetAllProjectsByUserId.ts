import { Request, Response, Router } from "express";
import { Connection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { User } from "../../entity/User";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class GetAllProjectsByUserId extends Page {
    private _connection: Connection;
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, connection: Connection) {
        super(router);
        this._connection = connection;
        this._userMiddleware = new UserMiddleware();
    }

    public OnGet() {
        // TODO: Require Authorisation
        super.router.get('/project/getAllProjectsByUserId/:userId', (req: Request, res: Response) => {
            const userRepository = this._connection.getRepository(User);

            userRepository.findOne({ Id: req.params.userId }).then(async user => {
                const projectUserRepository = this._connection.getRepository(ProjectUser);

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