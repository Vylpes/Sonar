import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { Router, Request, Response } from "express";
import { ProjectUser } from "../../../entity/ProjectUser";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";

export class Update extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/assign/update/:projectId/:userId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            if (!(await ProjectUser.HasPermission(req.params.projectId, req.session.User.Id, UserProjectPermissions.Promote))) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }

            const result = await ProjectUser.ToggleAdmin(req.params.projectId, req.params.userId, req.session.User);

            if (!result) {
                req.session.error = "An error occurred. Please try again";
                res.redirect('/projects/view/' + req.params.projectId);
                return;
            }

            res.redirect('/projects/view/' + req.params.projectId);
        });
    }
}
