import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class Register extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnPost() {
        super.router.post('/register', this._userMiddleware.Register, (req: Request, res: Response) => {
            req.session.success = "Successfully registered. You can now login";
            res.redirect('/auth/login');
        });
    }
}