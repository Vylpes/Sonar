import { Router } from "express";
import { Route } from "../contracts/Route";
import { List } from "./projects/list";
import { New } from "./projects/new";
import { View } from "./projects/view";
import { Assign } from "./projects/assign/assign";
import { Unassign } from "./projects/assign/unassign";
import { Update } from "./projects/assign/update";
import { Tasks } from "./projects/tasks";
import General from "./projects/settings/general";
import Assigned from "./projects/settings/assigned";

export class ProjectsRouter extends Route {
    private _list: List;
    private _new: New;
    private _view: View;
    private _assignAssign: Assign;
    private _assignUnassign: Unassign;
    private _assignUpdate: Update;
    private _tasks: Tasks;
    private _settingsGeneral: General;
    private _settingsAssigned: Assigned;

    constructor() {
        super();

        this._list = new List(super.router);
        this._new = new New(super.router);
        this._view = new View(super.router);
        this._assignAssign = new Assign(super.router);
        this._assignUnassign = new Unassign(super.router);
        this._assignUpdate = new Update(super.router);
        this._tasks = new Tasks(super.router);
        this._settingsGeneral = new General(super.router);
        this._settingsAssigned = new Assigned(super.router);
    }

    public Route(): Router {
        this._list.Route();
        this._new.Route();
        this._view.Route();
        this._assignAssign.Route();
        this._assignUnassign.Route();
        this._assignUpdate.Route();
        this._tasks.Route();
        this._settingsGeneral.Route();
        this._settingsAssigned.Route();

        return super.router;
    }
}
