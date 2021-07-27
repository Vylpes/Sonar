import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { ProjectsMiddleware } from "../../../middleware/projectsMiddleware";
import { Router, Request, Response } from "express";

export class Update extends Page {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware, projectsMiddleware: ProjectsMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
        this._projectsMiddleware = projectsMiddleware;
    }

    OnGet() {
        super.router.get('/assign/update/:projectid/:userid', this._userMiddleware.Authorise, this._projectsMiddleware.ToggleAdmin, (req: Request, res: Response) => {
            res.redirect('/projects/view/' + req.params.projectid);
        });
    }
}
