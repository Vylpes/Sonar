import { Router, Request, Response } from "express";
import { Route } from "../contracts/Route";
import { UserMiddleware } from "../middleware/userMiddleware";
import { Index } from "./dashboard/index";

export class DashboardRouter extends Route {
    private _userMiddleware: UserMiddleware;

    private _index: Index;

    constructor() {
        super();
        this._userMiddleware = new UserMiddleware();

        this._index = new Index(super.router, this._userMiddleware);
    }

    public Route(): Router {
        this._index.Route();

        return super.router;
    }
}