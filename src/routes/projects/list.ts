import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { UserMiddleware } from "../../middleware/userMiddleware";
import { ProjectsMiddleware } from "../../middleware/projectsMiddleware";

export class List extends Page {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware, projectsMiddleware: ProjectsMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
        this._projectsMiddleware = projectsMiddleware;
    }

    OnGet() {
        super.router.get('/list', this._userMiddleware.Authorise, this._projectsMiddleware.GetAllProjectsByUserId, (req: Request, res: Response) => {
            res.locals.viewData.projects = res.locals.projects;

            res.render('projects/list', res.locals.viewData);
        });
    }
}