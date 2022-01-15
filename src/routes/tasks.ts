import { Router } from "express";
import { Route } from "../contracts/Route";
import Assign from "./tasks/assign";
import { Assigned } from "./tasks/assigned";
import { Edit } from "./tasks/edit";
import { List } from "./tasks/list";
import { New } from "./tasks/new";
import { View } from "./tasks/view";
import Done from "./tasks/done";
import Archive from "./tasks/archive";

export class TasksRouter extends Route {
    private _list: List;
    private _assigned: Assigned;
    private _new: New;
    private _view: View;
    private _edit: Edit;
    private _assign: Assign;
    private _done: Done;
    private _archive: Archive;

    constructor() {
        super();
        
        this._list = new List(super.router);
        this._assigned = new Assigned(super.router);
        this._new = new New(super.router);
        this._view = new View(super.router);
        this._edit = new Edit(super.router);
        this._assign = new Assign(super.router);
        this._done = new Done(super.router);
        this._archive = new Archive(super.router);
    }

    public Route(): Router {
        this._list.Route();
        this._assigned.Route();
        this._new.Route();
        this._view.Route();
        this._edit.Route();
        this._assign.Route();
        this._done.Route();
        this._archive.Route();

        return super.router;
    }
}
