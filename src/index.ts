import { App } from "./app";
export class Index {
    private _app: App;

    constructor() {
        this._app = new App();

        this._app.Start(3000);
    }
}

const p = new Index();