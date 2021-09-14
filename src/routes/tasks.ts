import { Router } from "express";
import { Route } from "../contracts/Route";
import { Assigned } from "./tasks/assigned";
import { List } from "./tasks/list";

export class TasksRouter extends Route {
    private _list: List;
    private _assigned: Assigned;

    constructor() {
        super();
        
        this._list = new List(super.router);
        this._assigned = new Assigned(super.router);
    }

    public Route(): Router {
        this._list.Route();
        this._assigned.Route();

        return super.router;
    }
}
