import { Router } from "express";
import { Route } from "../contracts/Route";

export class ApiEndpoint extends Route {
    constructor() {
        super();
    }

    public Route(): Router {
        return super.router;
    }
}