import { Router, Request, Response } from "express";
import { UserMiddleware } from "../middleware/userMiddleware";

export class AuthRouter {
    private _router: Router;
    private _userMiddleware: UserMiddleware;

    constructor() {
        this._router = Router();
        this._userMiddleware = new UserMiddleware();
    }

    public Route(): Router {
        this.OnGetLogout();
        this.OnGetLogin();

        this.OnPostLogin();

        return this._router;
    }

    // GET method for /auth/logout
    private OnGetLogout() {
        this._router.get('/logout', (req: Request, res: Response) => {
            req.session.destroy(() => {
                res.redirect('/');
            });
        });
    }

    // GET method for /auth/login
    private OnGetLogin() {
        this._router.get('/login', (req: Request, res: Response) => {
            res.render('auth/login', { title: 'Login', message: res.locals.message });
        })
    }

    // POST method for /auth/login
    private OnPostLogin() {
        this._router.post('/login', this._userMiddleware.AuthenticateAgainstDatabase, (req: Request, res: Response) => {
            req.session.regenerate(() => {
                const user = res.locals.user;

                req.session.user.userId = user.userId;
                req.session.user.email = user.email;
                req.session.user.username = user.username;
                req.session.user.verified = user.verified === 1 ? true : false;
                req.session.user.admin = user.admin === 1 ? true : false;

                res.redirect('/dashboard');
            });
        });
    }
}