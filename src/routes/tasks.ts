import { Router } from "express";
import { Route } from "../contracts/Route";
import { Assigned } from "./tasks/assigned";
import { List } from "./tasks/list";
import { New } from "./tasks/new";

export class TasksRouter extends Route {
    private _list: List;
    private _assigned: Assigned;
    private _new: New;

    constructor() {
        super();
        
        this._list = new List(super.router);
        this._assigned = new Assigned(super.router);
        this._new = new New(super.router);
    }

    public Route(): Router {
        this._list.Route();
        this._assigned.Route();
        this._new.Route();

        return super.router;
    }
}
