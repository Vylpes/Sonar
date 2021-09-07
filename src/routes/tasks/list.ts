import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { UserMiddleware } from "../../middleware/userMiddleware";
import { TasksMiddleware } from "../../middleware/tasksMiddleware";

export class List extends Page {
    private _userMiddleware: UserMiddleware;
    private _tasksMiddleware: TasksMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware, tasksMiddleware: TasksMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
        this._tasksMiddleware = tasksMiddleware;
    }

    OnGet() {
        super.router.get('/list', this._userMiddleware.Authorise, this._tasksMiddleware.GetAllTasksVisibleToUser, (req: Request, res: Response) => {
            res.locals.viewData.tasks = res.locals.tasks;

            res.render('tasks/list', res.locals.viewData);
        });
    }
}
