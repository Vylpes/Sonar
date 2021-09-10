import { Router } from "express";
import { Connection } from "typeorm";
import { Route } from "../contracts/Route";
import { UserMiddleware } from "../middleware/userMiddleware";
import { AssignUserToProject } from "./project/AssignUserToProject";
import { CreateProject } from "./project/CreateProject";
import { GetAllProjectsByUserId } from "./project/GetAllProjectsByUserId";
import { GetProjectById } from "./project/GetProjectById";
import { GetUsersNotInProject } from "./project/GetUsersNotInProject";
import { ToggleAdmin } from "./project/ToggleAdmin";
import { UnassignUserFromProject } from "./project/UnassignUserFromProject";
import { GetAllTasksVisibleToUser } from "./task/GetAllTasksVisibleToUser";

export class ApiEndpoint extends Route {
    // Project
    private _getAllProjectsByUserId: GetAllProjectsByUserId;
    private _createProject: CreateProject;
    private _getProjectById: GetProjectById;
    private _getUsersNotInProject: GetUsersNotInProject;
    private _assignUserToProject: AssignUserToProject;
    private _unassignUserFromProject: UnassignUserFromProject;
    private _toggleAdmin: ToggleAdmin;

    // Task
    private _getAllTasksVisibleToUser: GetAllTasksVisibleToUser;

    constructor() {
        super();
        
        // Project
        this._getAllProjectsByUserId = new GetAllProjectsByUserId(super.router);
        this._createProject = new CreateProject(super.router);
        this._getProjectById = new GetProjectById(super.router);
        this._getUsersNotInProject = new GetUsersNotInProject(super.router);
        this._assignUserToProject = new AssignUserToProject(super.router);
        this._unassignUserFromProject = new UnassignUserFromProject(super.router);
        this._toggleAdmin = new ToggleAdmin(super.router);

        // Task
        this._getAllTasksVisibleToUser = new GetAllTasksVisibleToUser(super.router);
    }

    public Route(): Router {
        // Project
        this._getAllProjectsByUserId.Route();
        this._createProject.Route();
        this._getProjectById.Route();
        this._getUsersNotInProject.Route();
        this._assignUserToProject.Route();
        this._unassignUserFromProject.Route();
        this._toggleAdmin.Route();

        // Task

        return super.router;
    }
}