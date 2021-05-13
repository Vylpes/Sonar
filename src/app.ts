// Copyright (c) 2021 Vylpes. MIT License.

import { Express, Request, Response, NextFunction } from "express";

import express from "express";
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import { IndexRouter } from "./routes/indexRouter";

export class App {
    private _app: Express;

    private _indexRouter: IndexRouter;

    constructor() {
        this._app = express();
        this._indexRouter = new IndexRouter();
    }

    public Start(port: number) {
        this.SetupApp();
        this.SetupRoutes();
        this.SetupErrors();
        this.SetupListen(port);
    }

    private SetupApp() {
        this._app.set('views', path.join(process.cwd(), 'views'));
        this._app.set('view engine', 'pug');

        this._app.use(logger('dev'));
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: false }));
        this._app.use(cookieParser());
        this._app.use(express.static(path.join(process.cwd(), 'public')));
    }

    private SetupRoutes() {
        this._app.use('/', this._indexRouter.Route());
    }

    private SetupErrors() {
        // 404
        this._app.use(function(req: Request, res: Response, next: NextFunction) {
            next(createError(404));
        });

        // Error Handler
        this._app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
            // Set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // Render the error page
            res.status(err.status || 500);
            res.render('error');
        });
    }

    private SetupListen(port: number) {
        this._app.listen(port, () => {
            console.log(`Sonar listening at http://localhost:${port}`);
        });
    }
}