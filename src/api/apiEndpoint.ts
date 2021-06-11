import { Router } from "express";
import { Route } from "../contracts/Route";
import { UserMiddleware } from "../middleware/userMiddleware";
import { Username } from "./user/username";

export class ApiEndpoint extends Route {
    private _userMiddleware: UserMiddleware;

    private _username: Username;

    constructor() {
        super();
        this._userMiddleware = new UserMiddleware();

        this._username = new Username(super.router, this._userMiddleware);
    }

    public Route(): Router {
        this._username.Route();

        return super.router;
    }
}