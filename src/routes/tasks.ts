import { Router } from "express";
import { Route } from "../contracts/Route";
import { UserMiddleware } from "../middleware/userMiddleware";
import { TasksMiddleware} from "../middleware/tasksMiddleware";
import { List } from "./tasks/list";

export class TasksRouter extends Route {
    private _userMiddleware: UserMiddleware;
    private _tasksMiddleware: TasksMiddleware;

    private _list: List;

    constructor() {
        super();
        this._userMiddleware = new UserMiddleware();
        this._tasksMiddleware = new TasksMiddleware();
        
        this._list = new List(super.router, this._userMiddleware, this._tasksMiddleware);
    }

    public Route(): Router {
        this._list.Route();

        return super.router;
    }
}
