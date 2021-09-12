import { Request, Response, NextFunction } from "express";

export class PugMiddleware {
    public GetBaseString(req: Request, res: Response, next: NextFunction) {
        res.locals.viewData = {
            title: 'Sonar',
            message: res.locals.message,
            error: res.locals.error,
            isAuthenticated: req.session.User != null,
            user: req.session.User,
        };

        next();
    }
}