import { Request, Response, Router } from "express";
import { Page } from "../../../contracts/Page";
import { ProjectsMiddleware } from "../../../middleware/projectsMiddleware";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export class Unassign extends Page {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware, projectsMiddleware: ProjectsMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
        this._projectsMiddleware = projectsMiddleware;
    }

    OnGet() {
        super.router.get('/assign/unassign', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            res.redirect('/projects/list');
        });

        super.router.get('/assign/unassign/:id', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            res.redirect('/projects/view/' + req.params.id);
        });

        super.router.get('/assign/unassign/:id/:userid', this._userMiddleware.Authorise, this._projectsMiddleware.GetProjectById, this._userMiddleware.GetUserByUserId, (req: Request, res: Response) => {
            res.locals.viewData.user = res.locals.user;
            res.locals.viewData.project = res.locals.project;

            res.render('projects/assign/unassign', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/assign/unassign/:id/:userid', this._userMiddleware.Authorise, this._projectsMiddleware.UnassignUserFromProject, (req: Request, res: Response) => {
            req.session.success = "Unassigned user from project";

            res.redirect('/projects/view/' + req.params.id);
        });
    }
}