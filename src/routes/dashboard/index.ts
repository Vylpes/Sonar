import { Router, Request, Response } from "express";
import { UserMiddleware } from "../../middleware/userMiddleware";
import { Page } from "../../contracts/Page";

export class Index extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            res.render('dashboard/index', res.locals.viewData);
        });
    }
}