import { Request, Response, Router } from "express";
import { Page } from "../../contracts/Page";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class View extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        super.router.get('/view/:taskString', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const taskString = req.params.taskString;

            const task = await Task.GetTaskByTaskString(taskString, req.session.User);

            if (!task) {
                req.session.error = "Task not found";
                res.redirect('/tasks/list');
                return;
            }

            res.locals.viewData.task = task;
            
            res.render('tasks/view', res.locals.viewData);
        });
    }
}