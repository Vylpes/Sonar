import { Database } from "sqlite3";
import { existsSync } from "fs";

export class DatabaseHelper {
    public Init() {
        if (!this.DatabaseExists()) {
            const db = new Database('data.db');

            db.serialize(() => {
                db.run('CREATE TABLE cats (id TEXT UNIQUE, name TEXT)');
                db.close();

                console.log("Initialised Database");
            })
        }
    }

    public DatabaseExists(): Boolean {
        return existsSync(process.cwd() + "/data.db");
    }
}