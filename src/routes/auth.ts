import { Router } from "express";
import { Route } from "../contracts/Route";
import { Login } from "./auth/login";
import { Logout } from "./auth/logout";
import { Register } from "./auth/register";

export class AuthRouter extends Route {
    private _login: Login;
    private _logout: Logout;
    private _register: Register;

    constructor() {
        super();

        this._login = new Login(super.router);
        this._logout = new Logout(super.router);
        this._register = new Register(super.router);
    }

    public Route(): Router {
        this._login.Route();
        this._logout.Route();
        this._register.Route();

        return super.router;
    }
}