import { createConnection } from "typeorm";
import { App } from "./app";
export class Index {
    private _app: App;

    constructor() {
        createConnection().then(async _ => {
            this._app = new App();
            this._app.Start(3000);
        }).catch(e => console.error(e));
    }
}

const p = new Index();