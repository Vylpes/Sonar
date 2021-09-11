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
        super.router.get('/list', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            const connection = getConnection();

            const projectUserRepository = connection.getRepository(ProjectUser);
            const userRepository = connection.getRepository(User);

            let projects: Project[];

            const user = await userRepository.findOne(req.session.userId);

            if (!user) {
                throw new Error("Current user not found");
            }

            const projectUsers = await projectUserRepository.find({ User: user });
            
            projects = projectUsers.map(x => x.Project);

            res.locals.viewData.projects = projects;
            res.render('projects/list', res.locals.viewData);
        });
    }
}
