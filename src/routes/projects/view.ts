import { Request, Response, Router } from "express";
import { Page } from "../../contracts/Page";
import { ProjectsMiddleware } from "../../middleware/projectsMiddleware";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class View extends Page {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware, projectsMiddleware: ProjectsMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
        this._projectsMiddleware = projectsMiddleware;
    }

    OnGet() {
        super.router.get('/view/:id', this._userMiddleware.Authorise, this._projectsMiddleware.GetProjectById, (req: Request, res: Response) => {
            res.locals.viewData.project = res.locals.project;
            res.locals.viewData.userProjectRole = res.locals.userProjectRole;

            res.render('projects/view', res.locals.viewData);
        });
    }
}