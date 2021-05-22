import { Router } from "express";
import { Route } from "../contracts/Route";
import { UserMiddleware } from "../middleware/userMiddleware";
import { ProjectsMiddleware } from "../middleware/projectsMiddleware";
import { List } from "./projects/list";

export class ProjectsRouter extends Route {
    private _userMiddleware: UserMiddleware;
    private _projectsMiddleware: ProjectsMiddleware;

    private _list: List;

    constructor() {
        super();
        this._userMiddleware = new UserMiddleware();
        this._projectsMiddleware = new ProjectsMiddleware();

        this._list = new List(super.router, this._userMiddleware, this._projectsMiddleware);
    }

    public Route(): Router {
        this._list.Route();

        return super.router;
    }
}