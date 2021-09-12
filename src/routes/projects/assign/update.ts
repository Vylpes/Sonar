import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { Router, Request, Response } from "express";
import { ProjectUser } from "../../../entity/ProjectUser";

export class Update extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/assign/update/:projectId/:userId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
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
