import { hash } from "bcrypt";
import { Router, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { User } from "../../entity/User";
import { v4 as uuid } from "uuid";

export class Register extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnPost() {
        super.router.post('/register', async (req: Request, res: Response) => {
            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;
            const passwordRepeat = req.body.passwordRepeat;

            if (!username || !email || !password || !passwordRepeat) {
                req.session.error = "All fields are required";
                res.redirect('/auth/login');
                return;
            }

            if (User.RegisterUser(username, email, password, passwordRepeat)) {
                req.session.success = "You are now registered";
                res.redirect('/auth/login');
                return;
            }

            req.session.error = "Failed to register user. Please try again";
            res.redirect('/auth/login');
        });
    }
}