import { Request, Response, Router } from "express";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";
import { Page } from "../../../contracts/Page";
import { Project } from "../../../entity/Project";
import { ProjectUser } from "../../../entity/ProjectUser";
import { User } from "../../../entity/User";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export class Unassign extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/assign/unassign/:projectId/:userId', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            if (!ProjectUser.HasPermission(req.params.projectId, req.session.userId, UserProjectPermissions.Assign)) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }
            
            res.locals.viewData.user = await User.GetUser(req.params.userId);
            res.locals.viewData.project = await Project.GetProject(req.params.projectId, req.session.userId);

            res.render('projects/assign/unassign', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/assign/unassign/:projectId/:userId', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            ProjectUser.UnassignUserFromProject(req.params.projectId, req.params.userId, req.session.userId);

            req.session.success = "Unassigned user from project";
            res.redirect('/projects/view/' + req.params.id);
        });
    }
}