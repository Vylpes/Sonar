import { Request, Response, Router } from "express";
import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export class Unassign extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/assign/unassign/:id/:userid', this._userMiddleware.Authorise, this._projectsMiddleware.GetProjectById, this._userMiddleware.GetUserByUserId, (req: Request, res: Response) => {
            // res.locals.viewData.user = res.locals.user;
            // res.locals.viewData.project = res.locals.project;

            // res.render('projects/assign/unassign', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/assign/unassign/:id/:userid', this._userMiddleware.Authorise, this._projectsMiddleware.UnassignUserFromProject, (req: Request, res: Response) => {
            req.session.success = "Unassigned user from project";

            res.redirect('/projects/view/' + req.params.id);
        });
    }
}