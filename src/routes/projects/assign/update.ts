import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { Router, Request, Response } from "express";
import { ProjectUser } from "../../../entity/ProjectUser";

export class Update extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/assign/update/:projectId/:userId', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            await ProjectUser.ToggleAdmin(req.params.projectId, req.params.userId, req.session.userId);

            res.redirect('/projects/view/' + req.params.projectid);
        });
    }
}
