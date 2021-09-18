import { Router } from "express";
import { Route } from "../contracts/Route";
import { List } from "./projects/list";
import { New } from "./projects/new";
import { View } from "./projects/view";
import { Assign } from "./projects/assign/assign";
import { Unassign } from "./projects/assign/unassign";
import { Update } from "./projects/assign/update"; 
import { Edit } from "./projects/edit";
import { Tasks } from "./projects/tasks";

export class ProjectsRouter extends Route {
    private _list: List;
    private _new: New;
    private _view: View;
    private _assignAssign: Assign;
    private _assignUnassign: Unassign;
    private _assignUpdate: Update;
    private _edit: Edit;
    private _tasks: Tasks;

    constructor() {
        super();

        this._list = new List(super.router);
        this._new = new New(super.router);
        this._view = new View(super.router);
        this._assignAssign = new Assign(super.router);
        this._assignUnassign = new Unassign(super.router);
        this._assignUpdate = new Update(super.router);
        this._edit = new Edit(super.router);
        this._tasks = new Tasks(super.router);
    }

    public Route(): Router {
        this._list.Route();
        this._new.Route();
        this._view.Route();
        this._assignAssign.Route();
        this._assignUnassign.Route();
        this._assignUpdate.Route();
        this._edit.Route();
        this._tasks.Route();

        return super.router;
    }
}
