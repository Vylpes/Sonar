import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class List extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/list', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            res.locals.viewData.projects = await Project.GetAllProjects(req.session.User);

            res.render('projects/list', res.locals.viewData);
        });
    }
}
