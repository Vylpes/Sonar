import { Request, Response, Router } from "express";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";
import { Page } from "../../../contracts/Page";
import { ProjectUser } from "../../../entity/ProjectUser";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export class Unassign extends Page {
    constructor(router: Router) {
        super(router);
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