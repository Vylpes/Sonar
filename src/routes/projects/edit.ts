import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { UserMiddleware } from "../../middleware/userMiddleware";
import { ProjectsMiddleware } from "../../middleware/projectsMiddleware";

export class Edit extends Page {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    constructor(router: Router, userMiddleare: UserMiddleware, projectsMiddleware: ProjectsMiddleware) {
        super(router);
        this._userMiddleware = userMiddleare;
        this._projectsMiddleware = projectsMiddleware;
    }

    OnPost() {
        super.router.post('/edit', this._userMiddleware.Authorise, this._projectsMiddleware.EditProject, (req: Request, res: Response) => {
            res.redirect('/projects/view/' + res.locals.projectId);
        });
    }
}
