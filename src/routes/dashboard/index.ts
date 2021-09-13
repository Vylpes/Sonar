import { Router, Request, Response } from "express";
import { UserMiddleware } from "../../middleware/userMiddleware";
import { Page } from "../../contracts/Page";

export class Index extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/', UserMiddleware.Authorise, (req: Request, res: Response) => {
            res.render('dashboard/index', res.locals.viewData);
        });
    }
}