import { Request, Response, Router } from "express";
import { Page } from "../../../contracts/Page"
import { Task } from "../../../entity/Task";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export default class Unassign extends Page {
    constructor(router: Router) {
        super(router);
    }

    public override OnPost() {
        super.router.post('/assign/unassign', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const taskString = req.body.taskString;
            const user = req.session.User;

            if (!taskString) {
                req.session.error = "Not found";
                res.redirect('/tssks/list');
                return;
            }

            const result = await Task.UnassignUserFromTask(taskString, user);

            if (result) {
                req.session.success = "Unassigned user from task";    
            } else {
                req.session.error = "Unable to unassign user from task";
            }

            res.redirect(`/task/view/${taskString}`);
        });
    }
}