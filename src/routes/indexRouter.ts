import { Route } from "../contracts/Route";
import { Router } from "express";
import { Index } from "./index/index";

export class IndexRouter extends Route {
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