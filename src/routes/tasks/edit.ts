import { Request, Response, Router } from "express";
import { Page } from "../../contracts/Page";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class Edit extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        super.router.get('/edit/:taskString', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const taskString = req.params.taskString;

            const task = await Task.GetTaskByTaskString(taskString, req.session.User);

            if (!task) {
                req.session.error = "Task not found";
                res.redirect('/tasks/list');
                return;
            }

            res.locals.viewData.task = task;

            res.render('tasks/edit', res.locals.viewData);
        });
    }

    public OnPost() {
        super.router.post('/edit/:taskString', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const taskString = req.params.taskString;
            const name = req.body.name;
            const description = req.body.description;

            if (!name) {
                req.session.error = "Name is required";
                res.redirect(`/tasks/edit/${taskString}`);
                return;
            }

            const result = await Task.EditTask(taskString, name, description, req.session.User);

            if (!result) {
                req.session.error = 'Unable to edit task';
            }

            res.redirect(`/tasks/view/${taskString}`);
        });
    }
}