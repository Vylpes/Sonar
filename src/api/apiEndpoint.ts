import { Router } from "express";
import { Connection } from "typeorm";
import { Route } from "../contracts/Route";
import { UserMiddleware } from "../middleware/userMiddleware";
import { CreateProject } from "./project/CreateProject";
import { GetAllProjectsByUserId } from "./project/GetAllProjectsByUserId";

export class ApiEndpoint extends Route {
    private _connection: Connection;

    private _getAllProjectsByUserId: GetAllProjectsByUserId;
    private _createProject: CreateProject;

    constructor(connection: Connection) {
        super();
        this._connection = connection;
        
        this._getAllProjectsByUserId = new GetAllProjectsByUserId(super.router, this._connection);
        this._createProject = new CreateProject(super.router, this._connection);
    }

    public Route(): Router {
        this._getAllProjectsByUserId.Route();
        this._createProject.Route();

        return super.router;
    }
}