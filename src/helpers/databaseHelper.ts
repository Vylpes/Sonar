import { Database } from "sqlite3";
import { existsSync } from "fs";

export function DatabaseExists(): Boolean {
    return existsSync(process.cwd() + "/data.db");
}

export function InitialiseDatabase() {
    if (!DatabaseExists()) {
        const db = new Database('data.db');

        db.serialize(() => {
            db.run('CREATE TABLE cats (id TEXT UNIQUE, name TEXT)');

            db.close();

            console.log("Initialised Database");
        });
    }
}