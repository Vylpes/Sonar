import { compare } from "bcrypt";
import { Router, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { User } from "../../entity/User";

export class Login extends Page {
    constructor(router: Router) {
        super(router);
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
        super.router.post('/login', async (req: Request, res: Response) => {
            const email = req.body.email;
            const password = req.body.password;

            if (!email || !password) {
                req.session.error = "All fields are required";
                res.redirect('/auth/login');
                return;
            }

            if (await User.IsLoginCorrect(email, password)) {
                req.session.regenerate(() => {
                    const user = res.locals.user;
    
                    req.session.userId = user.id;
                    req.session.userEmail = user.email;
                    req.session.userName = user.username;
    
                    res.redirect('/dashboard');
                });
            } else {
                req.session.error = "Password is incorrect";
                res.redirect('/auth/login');
            }
        });
    }
}