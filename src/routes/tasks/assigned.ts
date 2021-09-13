import { Request, Response, Router } from "express";
import { Page } from "../../contracts/Page";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class Assigned extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        super.router.get('/assigned', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            res.locals.viewData.tasks = await Task.GetAssignedTasks(req.session.User.Id);

            res.render('tasks/assigned', res.locals.viewData)
        });
    }
}