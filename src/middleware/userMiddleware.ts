import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcrypt";
import { createConnection, RowDataPacket, QueryError } from "mysql2";
import { IUser } from "../models/IUser";
import { UserProjectRole } from "../constants/UserProjectRole";

export class UserMiddleware {
    public Login(req: Request, res: Response, next: NextFunction) {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            req.session.error = "All fields are required";
            res.redirect('/auth/login');
            return;
        }

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        connection.execute(`SELECT * FROM users WHERE email = ?`, [ email ], (err: QueryError, rows: RowDataPacket[]) => {
            if (err) throw err;

            if (rows.length != 1) {
                req.session.error = "User does not exist";
                res.redirect('/auth/login');
                connection.end();
                return;
            }

            const row = rows[0];

            compare(password, row.password, (err, same) => {
                if (err) throw err;

                if (same) {
                    res.locals.user = row;
                    next();

                    connection.end();
                    return;
                } else {
                    req.session.error = "Password is incorrect";
                    res.redirect('/auth/login');

                    connection.end();
                    return;
                }
            })
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

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        connection.execute('SELECT * FROM users WHERE email = ? OR username = ?', [ email, username ], (err: QueryError, rows: RowDataPacket[]) => {
            if (err) throw err;

            if (rows.length > 0) {
                req.session.error = "User already exists";
                res.redirect('/auth/login');

                connection.end();
                return;
            }

            connection.execute('SELECT * FROM users WHERE active = 1', (err: QueryError, rows1: RowDataPacket[]) => {
                if (err) throw err;

                var firstUser = false;

                if (rows1.length == 0) {
                    firstUser = true;
                }

                hash(password, 10).then(pwd => {
                    connection.execute('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)', [
                        uuidv4(),
                        email,
                        username,
                        pwd,
                        0,
                        firstUser ? 1 : 0,
                        1,
                    ], (err: QueryError) => {
                        if (err) throw err;

                        if (firstUser) {
                            console.log("First user has registered. This user is now the admin");
                        }

                        next();
                        connection.end();
                        return;
                    });
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

    public GetUserByUserId(req: Request, res: Response, next: NextFunction) {
        const currentUserId = req.session.userId;
        const userId = req.params.userid;
        const projectId = req.params.id;

        const connection = createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        let user: IUser;

        connection.execute('SELECT * FROM vwProjectUsers WHERE projectId = ? AND userId = ?', [ projectId, currentUserId ], (err: QueryError, users: RowDataPacket[]) => {
            if (err) throw err;

            if (users.length == 0) {
                req.session.error = "Project not found or you are not authorised to see it";
                res.redirect('/projects/list');

                connection.end();
                return;
            }

            const userRow = users[0];

            if (userRow.role != UserProjectRole.Admin) {
                req.session.error = "Unauthorised";
                res.redirect('/projects/view/' + projectId);

                connection.end();
                return;
            }

            connection.execute('SELECT * FROM users WHERE id = ?', [ userId ], (err: QueryError, users: RowDataPacket[]) => {
                if (err) throw err;

                if (users.length == 0) {
                    req.session.error = "User does not exist";
                    res.redirect('/projects/view/' + projectId);

                    connection.end();
                    return;
                }

                const userRow = users[0];

                user = {
                    userId: userRow.id,
                    username: userRow.username,
                    email: userRow.email,
                    verified: userRow.verified == 1 ? true : false,
                    active: userRow.active == 1 ? true : false,
                    admin: userRow.admin == 1 ? true : false,
                };
    
                res.locals.user = user;
                
                next();
                connection.end();
                return;
            });
        });
    }
}
