import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { ProjectsMiddleware } from "../../../middleware/projectsMiddleware";
import { Router, Request, Response } from "express";

export class View extends Page {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware, projectsMiddleware: ProjectsMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
        this._projectsMiddleware = projectsMiddleware;
    }

    OnGet() {
        // No id given, not found
        super.router.get('/assign', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            res.redirect('/projects/list');
        });

        // TODO: /assign/:id
        // TODO: /assign/:id/:user
    }
}