import { Router } from "express";
import { Route } from "../contracts/Route";
import { Index } from "./dashboard/index";

export class DashboardRouter extends Route {
    private _index: Index;

    constructor() {
        super();

        this._index = new Index(super.router);
    }

    public Route(): Router {
        this._index.Route();

        return super.router;
    }
}