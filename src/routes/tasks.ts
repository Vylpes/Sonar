import { Router } from "express";
import { Route } from "../contracts/Route";
import { List } from "./tasks/list";

export class TasksRouter extends Route {
    private _list: List;

    constructor() {
        super();
        
        this._list = new List(super.router);
    }

    public Route(): Router {
        this._list.Route();

        return super.router;
    }
}
