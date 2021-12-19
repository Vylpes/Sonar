import { Request, Response, Router } from "express";
import { Page } from "../../contracts/Page";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export default class Done extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnPost(): void {
        super.router.post('/done', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const taskString = req.body.taskString;
            const user = req.session.User;

            if (!taskString) {
                req.session.error = "All fields are required";
                res.redirect('/tasks/list');
                return;
            }

            const result = await Task.ToggleTaskCompleteStatus(taskString, user);

            if (!result) {
                req.session.error = "There was an error";
            }

            res.redirect(`/tasks/view/${taskString}`);
        });
    }
}