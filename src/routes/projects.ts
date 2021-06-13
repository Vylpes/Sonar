import { Router } from "express";
import { Route } from "../contracts/Route";
import { UserMiddleware } from "../middleware/userMiddleware";
import { ProjectsMiddleware } from "../middleware/projectsMiddleware";
import { List } from "./projects/list";
import { New } from "./projects/new";
import { View } from "./projects/view";
import { Edit } from "./projects/edit";

export class ProjectsRouter extends Route {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    private _list: List;
    private _new: New;
    private _view: View;
    private _edit: Edit;

    constructor() {
        super();
        this._userMiddleware = new UserMiddleware();
        this._projectsMiddleware = new ProjectsMiddleware();

        this._list = new List(super.router, this._userMiddleware, this._projectsMiddleware);
        this._new = new New(super.router, this._userMiddleware, this._projectsMiddleware);
        this._view = new View(super.router, this._userMiddleware, this._projectsMiddleware);
        this._edit = new Edit(super.router, this._userMiddleware, this._projectsMiddleware);
    }

    public Route(): Router {
        this._list.Route();
        this._new.Route();
        this._view.Route();
        this._edit.Route();

        return super.router;
    }
}
