import { Router, Request, Response } from "express";

export class IndexRouter {
    private _router: Router;

    constructor() {
        this._router = Router();
    }

    public Route(): Router {
        this.OnGetIndex();

        return this._router;
    }

    // GET method for /
    private OnGetIndex() {
        this._router.get('/', (req: Request, res: Response) => {
            res.render('index/index', res.locals.viewData);
        });
    }
}