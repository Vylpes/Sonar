import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";

export class Logout extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/logout', (req: Request, res: Response) => {
            req.session.destroy(() => {
                res.redirect('/');
            });
        });
    }
}