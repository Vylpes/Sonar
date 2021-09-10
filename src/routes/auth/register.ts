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
        super.router.post('/register', (req: Request, res: Response) => {
            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;
            const passwordRepeat = req.body.passwordRepeat;

            if (!username || !email || !password || !passwordRepeat) {
                req.session.error = "All fields are required";
                res.redirect('/auth/login');
                return;
            }

            if (password !== passwordRepeat) {
                req.session.error = "Passwords do not match";
                res.redirect('/auth/login');
                return;
            }

            if (password.length < 7) {
                req.session.error = "Password must be at least 7 characters long";
                res.redirect('/auth/login');
                return;
            }

            const connection = getConnection();

            const userRepository = connection.getRepository(User);

            userRepository.findAndCount({ Email: email }).then((userEmail) => {
                if(userEmail[1] > 0) {
                    req.session.error = "User already exists";
                    res.redirect('/auth/login');
                    return;
                }

                userRepository.findAndCount({ Username: username }).then((userUsername) => {
                    if (userUsername[1] > 0) {
                        req.session.error = "User already exists";
                        res.redirect('/auth/login');
                        return;
                    }

                    userRepository.find({ Active: true }).then(activeUsers => {
                        var firstUser = activeUsers.length == 0;

                        hash(password, 10).then(pwd => {
                            const user = new User(uuid(), email, username, pwd, false, firstUser, true);

                            userRepository.save(user);

                            if (firstUser) console.log("First user was registered. This user is now the admin");

                            req.session.success = "Successfully registered. You can now login";
                            res.redirect('/auth/login');
                        });
                    }).catch(e => {
                        throw new Error(e);
                    })
                }).catch(e => {
                    throw new Error(e);
                });
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}