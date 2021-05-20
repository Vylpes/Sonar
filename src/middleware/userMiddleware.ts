import { Database } from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { hash } from "bcrypt";

export class UserMiddleware {
    public AuthenticateAgainstDatabase(req: Request, res: Response, next: NextFunction) {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            req.session.error = "Email and/or Password were not set";
            res.redirect('/auth/login');
            return;
        }

        const db = new Database("data.db");

        db.serialize(() => {
            db.all(`SELECT * FROM users WHERE email = '${email}'`, (err, rows) => {
                if (rows.length != 1) {
                    req.session.error = "User does not exist";
                    res.redirect('/auth/login');
                    return;
                }

                const row = rows[0];
                const hashedPassword = hash(password, 10);

                if (row.password === hashedPassword) {
                    res.locals.user = row;
                    next();
                } else {
                    req.session.error = "Password is incorrect";
                    res.redirect('/auth/login');
                    return;
                }
            });
        });

        db.close();
    }

    public Authorise(req: Request, res: Response, next: NextFunction) {
        if (req.session.user) {
            next();
        } else {
            req.session.error = "Access denied";
            res.redirect('/auth/login');
        }
    }
}