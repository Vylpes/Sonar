import { Router, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { User } from "../../entity/User";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class List extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/list', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            const connection = getConnection();

            const projectUserRepository = connection.getRepository(ProjectUser);
            const userRepository = connection.getRepository(User);

            let projects: Project[];

            userRepository.findOne(req.session.userId).then(user => {
                projectUserRepository.find({ User: user }).then(projectUsers => {
                    projects = projectUsers.map(x => x.Project);

                    res.locals.viewData.projects = projects;
                    res.render('projects/list', res.locals.viewData);
                }).catch(e => {
                    throw new Error(e);
                });
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}
