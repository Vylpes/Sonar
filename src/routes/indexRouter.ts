import { Router, Request, Response } from "express";
import { CatMiddleware } from "../middleware/catMiddleware";

export class IndexRouter {
    private _router: Router;
    private _catMiddleware: CatMiddleware;

    constructor() {
        this._router = Router();
        this._catMiddleware = new CatMiddleware();
    }

    public Route(): Router {
        this.OnGetIndex();

        return this._router;
    }

    // GET method for /
    private OnGetIndex() {
        this._router.get('/', this._catMiddleware.InsertAndGetCat1, (req: Request, res: Response) => {
            console.log(res.locals.catRows);

            res.render('index/index', { title: 'Sonar' });
        });
    }
}