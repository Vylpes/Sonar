import { Request, Response, Router } from "express";
import { Page } from "../../contracts/Page";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export default class Archive extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnPost() {
        super.router.post('/archive', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const taskString = req.body.taskString;
            const currentUser = req.session.User;

            if (!taskString) {
                req.session.error = "All fields are required";
                res.redirect('/tasks/list');
                return;
            }

            const result = await Task.ToggleTaskArchiveStatus(taskString, currentUser);

            if (!result) {
                req.session.error = "There was an error, please try again";
            }

            res.redirect(`/tasks/view/${taskString}`);
        });
    }
}