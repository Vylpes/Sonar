// Copyright (c) 2021 Vylpes. MIT License.

import express from "express";

export class IndexRouter {
    private _router: express.Router;

    constructor() {
        this._router = express.Router();
    }

    public Route(): express.Router {
        this.OnGetIndex();

        return this._router;
    }

    // GET method for /
    private OnGetIndex() {
        this._router.get('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
            res.render('index/index', { title: 'Sonar' });
        });
    }
}