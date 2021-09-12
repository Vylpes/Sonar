import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class List extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/list', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            res.locals.viewData.tasks = Task.GetAllTasks(req.session.User);

            res.render('tasks/list', res.locals.viewData);
        });
    }
}
