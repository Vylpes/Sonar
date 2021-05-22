import { Router } from "express";

interface IPage {
    Route(): any;
    OnGet(): any;
    OnPost(): any;
}

export class Page implements IPage {
    private _router: Router;

    constructor(router: Router) {
        this._router = router;
    }

    get router() {
        return this._router;
    }

    Route() {
        this.OnGet();
        this.OnPost();
    }

    OnGet() {}
    
    OnPost() {}
}