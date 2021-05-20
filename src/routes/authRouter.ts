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
        this.OnGetRegister();

        this.OnPostLogin();
        this.OnPostRegister();

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

    // GET method for /auth/register
    private OnGetRegister() {
        this._router.get('/register', (req: Request, res: Response) => {
            res.render('auth/register', { title: 'Register', message: res.locals.message });
        });
    }

    // POST method for /auth/login
    private OnPostLogin() {
        this._router.post('/login', this._userMiddleware.Login, (req: Request, res: Response) => {
            req.session.regenerate(() => {
                const user = res.locals.user;

                req.session.userId = user.id;
                req.session.userEmail = user.email;
                req.session.userName = user.username;

                res.redirect('/dashboard');
            });
        });
    }

    // POST method for /auth/register
    private OnPostRegister() {
        this._router.post('/register', this._userMiddleware.Register, (req: Request, res: Response) => {
            req.session.success = "Successfully registered. You can now login";
            res.redirect('/auth/login');
        });
    }
}