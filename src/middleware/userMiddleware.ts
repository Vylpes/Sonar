import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcrypt";
import { createConnection, RowDataPacket, QueryError } from "mysql2";
import { IUser } from "../models/IUser";
import { UserProjectRole } from "../constants/UserProjectRole";

export class UserMiddleware {
    public Authorise(req: Request, res: Response, next: NextFunction) {
        if (req.session.userId) {
            next();
        } else {
            req.session.error = "Access denied";
            res.redirect('/auth/login');
        }
    }
}
