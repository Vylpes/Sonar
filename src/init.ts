import { DatabaseHelper } from "./helpers/databaseHelper";
import dotenv from "dotenv";

export class Init {
    private _databaseHelper: DatabaseHelper;

    constructor() {
        dotenv.config();

        this._databaseHelper = new DatabaseHelper();
    }

    init() {
        this._databaseHelper.init();
    }
}

const p = new Init();
p.init();