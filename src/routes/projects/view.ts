import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { User } from "../../entity/User";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class View extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/view/:projectId', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            const project = await Project.GetProject(req.params.projectId, req.session.userId);

            res.locals.viewData.project = project;
            res.locals.viewData.projectUsers = project.ProjectUsers;
            res.locals.viewData.userProjectRole = ProjectUser.GetRole(project.Id, req.session.userId);

            res.render('projects/view', res.locals.viewData);
        });
    }
}