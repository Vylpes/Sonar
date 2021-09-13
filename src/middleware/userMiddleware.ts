import { Request, Response, NextFunction } from "express";

export class UserMiddleware {
    public static Authorise(req: Request, res: Response, next: NextFunction) {
        if (req.session.User) {
            next();
        } else {
            req.session.error = "Access denied";
            res.redirect('/auth/login');
        }
    }
}
