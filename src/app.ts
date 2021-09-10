import "reflect-metadata";
import { Express, Request, Response, NextFunction } from "express";
import { PugMiddleware } from "./middleware/pugMiddleware";

import express from "express";
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import * as dotenv from "dotenv";

import { AuthRouter } from "./routes/auth";
import { DashboardRouter } from "./routes/dashboard";
import { IndexRouter } from "./routes";
import { ProjectsRouter } from "./routes/projects";
import { TasksRouter } from "./routes/tasks";

import { ApiEndpoint } from "./api/apiEndpoint";
import { Connection } from "typeorm";

export class App {
    private _app: Express;
    private _pugMiddleware: PugMiddleware;

    private _authRouter: AuthRouter;
    private _dashboardRouter: DashboardRouter;
    private _indexRouter: IndexRouter;
    private _projectsRouter: ProjectsRouter;
    private _tasksRouter: TasksRouter;

    private _apiEndpoint: ApiEndpoint;

    constructor() {
        this._app = express();
        this._pugMiddleware = new PugMiddleware();

        this._authRouter = new AuthRouter();
        this._dashboardRouter = new DashboardRouter();
        this._indexRouter = new IndexRouter();
        this._projectsRouter = new ProjectsRouter();
        this._tasksRouter = new TasksRouter();

        this._apiEndpoint = new ApiEndpoint();
    }

    public Start(port: number) {
        this.SetupApp();
        this.SetupRoutes();
        this.SetupErrors();
        this.SetupListen(port);
    }

    private SetupApp() {
        dotenv.config();

        this._app.set('views', path.join(process.cwd(), 'views'));
        this._app.set('view engine', 'pug');

        this._app.use(logger('dev'));
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: false }));
        this._app.use(cookieParser());
        this._app.use(express.static(path.join(process.cwd(), 'public')));
        this._app.use(session({
            resave: false, // don't save session if unmodified
            saveUninitialized: false, // don't create session until something stored
            secret: process.env.EXPRESS_SESSION_SECRET,
        }));

        // Session-persisted message middleware
        this._app.use(function(req, res, next){
            var err = req.session.error;
            var msg = req.session.success;
            delete req.session.error;
            delete req.session.success;
            if (err) res.locals.error = err;
            if (msg) res.locals.message = msg;
            next();
        });

        this._app.use(this._pugMiddleware.GetBaseString);
    }

    private SetupRoutes() {
        this._app.use('/', this._indexRouter.Route());
        this._app.use('/auth', this._authRouter.Route());
        this._app.use('/dashboard', this._dashboardRouter.Route());
        this._app.use('/projects', this._projectsRouter.Route());
        this._app.use('/tasks', this._tasksRouter.Route());

        this._app.use('/api', this._apiEndpoint.Route());
    }

    private SetupErrors() {
        // 404
        this._app.use(function(req: Request, res: Response, next: NextFunction) {
            next(createError(404));
        });

        // Error Handler
        this._app.use(function(err: any, req: Request, res: Response) {
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
