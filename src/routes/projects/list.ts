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
            // const projects = await Project.GetAllProjects(req.session.userId);

            // res.locals.viewData.projects = await Project.ToObjectArray(projects);
            res.locals.viewData.projects = await Project.GetAllProjects(req.session.userId);

            res.render('projects/list', res.locals.viewData);
        });
    }
}
