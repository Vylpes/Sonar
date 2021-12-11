import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { Router, Request, Response } from "express";
import { ProjectUser } from "../../../entity/ProjectUser";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";

export class Update extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnPost(): void {
        super.router.post('/assign/update', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectId = req.body.projectId;
            const assignedUserId = req.body.userId;
            const currentUser = req.session.User;

            if (!projectId) {
                req.session.error = "Project not found or you are not authorised to see it";
                res.redirect('/projects/list');
                return;
            }

            if (!(await ProjectUser.HasPermission(projectId, currentUser.Id, UserProjectPermissions.Assign))) {
                req.session.error = "Project not found or you are not authoirsed to see it";
                res.redirect('/projects/list');
                return;
            }

            if (!assignedUserId) {
                req.session.error = "All fields are required";
                res.redirect(`/projects/settings/assigned/${projectId}`);
                return;
            }

            const result = await ProjectUser.ToggleAdmin(projectId, assignedUserId, currentUser);

            if (result) {
                req.session.success = "Successfully updated user";
            } else {
                req.session.error = "An error occurred. Please try again.";
            }

            res.redirect(`/projects/settings/assigned/${projectId}`);
        });
    }
}
