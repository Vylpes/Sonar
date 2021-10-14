import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { User } from "../../entity/User";

export class Login extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/login', (req: Request, res: Response) => {
            if (res.locals.viewData.isAuthenticated) {
                res.redirect('/dashboard');
		return;
            }

            res.render('auth/login', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/login', async (req: Request, res: Response) => {
            const email = req.body.email;
            const password = req.body.password;

            if (!email || !password) {
                req.session.error = "All fields are required";
                res.redirect('/auth/login');
                return;
            }

            if (await User.IsLoginCorrect(email, password)) {
                req.session.regenerate(async () => {
                    const user = await User.GetUserByEmailAddress(email);
    
                    req.session.User = user;
    
                    res.redirect('/dashboard');
                });
            } else {
                req.session.error = "Password is incorrect";
                res.redirect('/auth/login');
            }
        });
    }
}
