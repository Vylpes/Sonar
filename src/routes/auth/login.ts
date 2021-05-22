import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class Login extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/login', (req: Request, res: Response) => {
            if (res.locals.viewData.user.authenticated) {
                res.redirect('/dashboard');
            }

            res.render('auth/login', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/login', this._userMiddleware.Login, (req: Request, res: Response) => {
            req.session.regenerate(() => {
                const user = res.locals.user;

                req.session.userId = user.id;
                req.session.userEmail = user.email;
                req.session.userName = user.username;

                res.redirect('/dashboard');
            });
        });
    }
}