import { Router, Request, Response } from "express";
import { UserMiddleware } from "../middleware/userMiddleware";

export class DashboardRouter {
    private _router: Router;
    private _userMiddleware: UserMiddleware;

    constructor() {
        this._router = Router();
        this._userMiddleware = new UserMiddleware();
    }

    public Route(): Router {
        this.OnGetIndex();

        return this._router;
    }

    // GET method for /dashboard
    private OnGetIndex() {
        this._router.get('/', this._userMiddleware.Authorise, (req: Request, res: Response) => {
            res.render('dashboard/index', { title: 'Dashboard' });
        });
    }
}