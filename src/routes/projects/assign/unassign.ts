import { Request, Response, Router } from "express";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";
import { Page } from "../../../contracts/Page";
import { Project } from "../../../entity/Project";
import { ProjectUser } from "../../../entity/ProjectUser";
import { User } from "../../../entity/User";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export class Unassign extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/assign/unassign/:projectId/:userId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            if (!(await ProjectUser.HasPermission(req.params.projectId, req.session.User.Id, UserProjectPermissions.Assign))) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }
            
            res.locals.viewData.unassignedUser = await User.GetUser(req.params.userId);
            res.locals.viewData.project = await Project.GetProject(req.params.projectId, req.session.User);

            res.render('projects/assign/unassign', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/assign/unassign/:projectId/:userId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            if (!(await ProjectUser.HasPermission(req.params.projectId, req.session.User.Id, UserProjectPermissions.Assign))) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }

            if (await ProjectUser.UnassignUserFromProject(req.params.projectId, req.params.userId, req.session.User)) {
                req.session.success = "Unassigned user from project";
                res.redirect('/projects/view/' + req.params.projectId);

                return;
            }

            req.session.error = "There was an error";
            res.redirect('/projects/view/' + req.params.projectId);
        });
    }
}