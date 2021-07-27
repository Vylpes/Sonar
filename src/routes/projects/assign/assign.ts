import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { ProjectsMiddleware } from "../../../middleware/projectsMiddleware";
import { Router, Request, Response } from "express";

export class Assign extends Page {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware, projectsMiddleware: ProjectsMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
        this._projectsMiddleware = projectsMiddleware;
    }

    OnGet() {
        super.router.get('/assign/assign', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            res.redirect('/projects/list');
        });

        super.router.get('/assign/assign/:id', this._userMiddleware.Authorise, this._projectsMiddleware.GetProjectById, this._projectsMiddleware.GetUsersNotInProject, (req: Request, res: Response) => {
            res.locals.viewData.project = res.locals.project;
            res.locals.viewData.users = res.locals.users;

            res.render('projects/assign/assign', res.locals.viewData);
        });

        super.router.get('/assign/assign/:id/:userid', this._userMiddleware.Authorise, this._projectsMiddleware.GetProjectById, this._userMiddleware.GetUserByUserId, (req: Request, res: Response) => {
            res.locals.viewData.user = res.locals.user;
            res.locals.viewData.project = res.locals.project;

            res.render('projects/assign/assignConfirm', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/assign/assign/:id/:userid', this._userMiddleware.Authorise, this._projectsMiddleware.AssignUserToProject, (req: Request, res: Response) => {
            req.session.success = "Assigned user to project";

            res.redirect('/projects/view/' + req.params.id);
        });
    }
}