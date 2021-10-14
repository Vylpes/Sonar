import { Router } from "express"

interface IRoute {
    Route(): Router;
}

export class Route implements IRoute {
    private _router: Router;

    constructor() {
        this._router = Router();
    }

    get router() {
        return this._router;
    }

    Route(): Router {
        return this._router;
    }
}
