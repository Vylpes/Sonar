import { Request, Response, Router } from "express";
import { Page } from "../../../contracts/Page";
import { Task } from "../../../entity/Task";
import { User } from "../../../entity/User";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export default class Assign extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnPost() {
        super.router.post('/assign/assign', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const taskString = req.body.taskString;
            const userId = req.body.userId;
            const currentUser = req.session.User;

            if (!taskString) {
                req.session.error = "Not found";
                res.redirect('/tasks/list');
                return;
            }

            if (!userId) {
                req.session.error = "All fields are required";
                res.redirect(`/tasks/view/${taskString}`);
                return;
            }
            
            const user = await User.GetUser(userId);

            if (!user) {
                req.session.error = "Cannot find user";
                res.redirect(`/tasks/view/${taskString}`);
                return;
            }

            const result = await Task.AssignUserToTask(taskString, user, currentUser);

            if (result) {
                req.session.success = "Assigned user to task";    
            } else {
                req.session.error = "Unable to assign user to task";
            }

            res.redirect(`/tasks/view/${taskString}`);
        });
    }
}