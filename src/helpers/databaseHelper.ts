import { Database } from "sqlite3";
import { existsSync } from "fs";

export class DatabaseHelper {
    public Init() {
        if (!this.DatabaseExists()) {
            const db = new Database(process.env.SQLITE3_DB);

            db.serialize(() => {
                db.run('CREATE TABLE users (id TEXT UNIQUE, email TEXT, username TEXT, password TEXT, verified BIT, admin BIT, active BIT)');

                db.close();

                console.log("Initialised Database");
            })
        }
    }

    public DatabaseExists(): Boolean {
        return existsSync(process.cwd() + "/data.db");
    }
}