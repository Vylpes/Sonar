import { Express, Request, Response, NextFunction } from "express";
import { DatabaseHelper } from "./helpers/databaseHelper";
import { PugMiddleware } from "./middleware/pugMiddleware";

import express from "express";
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";

import { AuthRouter } from "./routes/authRouter";
import { DashboardRouter } from "./routes/dashboardRouter";
import { IndexRouter } from "./routes/indexRouter";

export class App {
    private _app: Express;
    private _databaseHelper: DatabaseHelper;
    private _pugMiddleware: PugMiddleware;

    private _authRouter: AuthRouter;
    private _dashboardRouter: DashboardRouter;
    private _indexRouter: IndexRouter;

    constructor() {
        this._app = express();
        this._databaseHelper = new DatabaseHelper();
        this._pugMiddleware = new PugMiddleware();

        this._authRouter = new AuthRouter();
        this._dashboardRouter = new DashboardRouter();
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
        this._app.use(session({
            resave: false, // don't save session if unmodified
            saveUninitialized: false, // don't create session until something stored
            secret: 'DEV_SECRET_NEEDS_CHANGING', // TODO: Replace before release
        }));

        // Session-persisted message middleware
        this._app.use(function(req, res, next){
            var err = req.session.error;
            var msg = req.session.success;
            delete req.session.error;
            delete req.session.success;
            res.locals.message = '';
            if (err) res.locals.error = err;
            if (msg) res.locals.message = msg;
            next();
        });

        this._app.use(this._pugMiddleware.GetBaseString);

        this._databaseHelper.Init();
    }

    private SetupRoutes() {
        this._app.use('/', this._indexRouter.Route());
        this._app.use('/auth', this._authRouter.Route());
        this._app.use('/dashboard', this._dashboardRouter.Route());
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