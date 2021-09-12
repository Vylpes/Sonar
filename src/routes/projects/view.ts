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
            const project = await Project.GetProject(req.params.projectId, req.session.User);

            if (!project) {
                req.session.error = "Project not found";
                res.redirect('/projects/list');
                return;
            }

            const role = await ProjectUser.GetRole(project.Id, req.session.User.Id);

            if (typeof role != "number" && !role) {
                req.session.error = "Project not found";
                res.redirect('/projects/list');
                return;
            }

            res.locals.viewData.project = project;
            res.locals.viewData.projectUsers = project.ProjectUsers;
            res.locals.viewData.userProjectRole = role;

            res.render('projects/view', res.locals.viewData);
        });
    }
}