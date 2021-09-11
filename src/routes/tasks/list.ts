import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class List extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/list', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            res.locals.viewData.tasks = Task.GetAllTasks(req.session.userId);

            res.render('tasks/list', res.locals.viewData);
        });
    }
}
