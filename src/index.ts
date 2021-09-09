import { createConnection } from "typeorm";
import { App } from "./app";
export class Index {
    private _app: App;

    constructor() {
        createConnection().then(async connection => {
            this._app = new App(connection);
            this._app.Start(3000);
        }).catch(e => console.error(e));
    }
}

const p = new Index();