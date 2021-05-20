// Copyright (c) 2021 Vylpes. MIT License.

import { Router, Request, Response } from "express";
import { SetupCatTable } from "../helpers/catHelper";

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
        this._router.get('/', SetupCatTable, (req: Request, res: Response) => {
            console.log(res.locals.catRows);

            res.render('index/index', { title: 'Sonar' });
        });
    }
}