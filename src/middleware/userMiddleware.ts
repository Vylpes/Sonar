import { Database } from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcrypt";

export class UserMiddleware {
    public Login(req: Request, res: Response, next: NextFunction) {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            req.session.error = "All fields are required";
            res.redirect('/auth/login');
            return;
        }

        const db = new Database(process.env.SQLITE3_DB);

        db.all(`SELECT * FROM users WHERE email = '${email}'`, (err, rows) => {
            if (rows.length != 1) {
                req.session.error = "User does not exist";
                res.redirect('/auth/login');
                return;
            }

            const row = rows[0];

            compare(password, row.password, (err, same) => {
                if (err) throw err;

                if (same) {
                    res.locals.user = row;
                    next();
                    db.close();
                } else {
                    req.session.error = "Password is incorrect";
                    res.redirect('/auth/login');

                    db.close();
                    return;
                }
            });
        });
    }

    public Register(req: Request, res: Response, next: NextFunction) {
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

        const db = new Database(process.env.SQLITE3_DB);

        db.all(`SELECT * FROM users WHERE email = '${email}' OR username = '${username}'`, (err, rows) => {
            if (err) throw err;

            if (rows.length > 0) {
                req.session.error = "User already exists";
                res.redirect('/auth/login');
                
                db.close();
                return;
            }

            db.all(`SELECT * FROM users WHERE active = 1`, (err1, rows1) => {
                if (err1) throw err1;

                var firstUser = false;
                
                if (rows1.length == 0) {
                    firstUser = true;
                }
                
                var stmt = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)');

                hash(password, 10).then(pwd => {
                    console.log(pwd);
                    stmt.run(uuidv4(), email, username, pwd, 0, firstUser ? 1 : 0, 1);
    
                    stmt.finalize();
    
                    if (firstUser) {
                        console.log("First user has registered. This user is now the admin");
                    }
    
                    next();
                    db.close();
                });
            });
        });
    }

    public Authorise(req: Request, res: Response, next: NextFunction) {
        if (req.session.userId) {
            next();
        } else {
            req.session.error = "Access denied";
            res.redirect('/auth/login');
        }
    }
}