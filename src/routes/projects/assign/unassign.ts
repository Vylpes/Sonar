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
        super.router.post('/assign/unassign', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectId = req.body.projectId;
            const unassignUserId = req.body.userId;
            const currentUser = req.session.User;

            if (!projectId) {
                req.session.error = "Project not found or you do not have permission to see it";
                res.redirect('/projects/list');
                return;
            }

            if (!(await ProjectUser.HasPermission(projectId, currentUser.Id, UserProjectPermissions.Assign))) {
                req.session.error = "Project not found or you do not have permission to see it";
                res.redirect("/projects/list");
                return;
            }

            if (!unassignUserId) {
                req.session.error = "All fields are required";
                res.redirect(`/projects/settings/assigned/${projectId}`);
                return;
            }

            const result = await ProjectUser.UnassignUserFromProject(projectId, unassignUserId, currentUser);

            if (result) {
                req.session.success = "Unassigned user from project";
            } else {
                req.session.error = "There was an error";
            }

            res.redirect(`/projects/settings/assigned/${projectId}`);
        });
    }
}