import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { UserMiddleware } from "../../middleware/userMiddleware";
import { createConnection, QueryError, RowDataPacket } from "mysql2";

interface IUserApiGETResponse {
    isSuccess: boolean;
    userId: string;
    email: string;
    username: string;
    verified: boolean;
    admin: boolean;
    active: boolean;
}

export class Username extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/user/username', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            res.json({ isSuccess: false });
        });

        super.router.get('/user/username/:username', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            const username = req.params.username;

            const connection = createConnection({
                host: process.env.MYSQL_HOST,
                port: 3306,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
            });

            let apiResponse: IUserApiGETResponse;

            connection.execute('SELECT * FROM users WHERE username = ?', [ username ], (err: QueryError, users: RowDataPacket[]) => {
                if (err) throw err;

                if (users.length != 1) {
                    res.json({ isSuccess: false });
                    connection.end();
                    return;
                }

                const user = users[0];

                apiResponse = {
                    isSuccess: true,
                    userId: user.id,
                    email: user.email,
                    username: user.username,
                    verified: user.verified == 1 ? true : false,
                    admin: user.admin == 1 ? true : false,
                    active: user.active == 1 ? true : false,
                };

                res.json(apiResponse);
                connection.end();
                return;
            });
        });
    }
}