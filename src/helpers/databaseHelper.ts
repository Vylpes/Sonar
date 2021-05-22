import { Database } from "sqlite3";
import { existsSync, readFileSync } from "fs";

export class DatabaseHelper {
    public Init() {
        if (!this.DatabaseExists()) {
            const db = new Database(process.env.SQLITE3_DB);

            db.serialize(() => {
                // tables
                db.run(readFileSync("./data/tables/users.sql").toString());
                db.run(readFileSync("./data/tables/projects.sql").toString());
                db.run(readFileSync("./data/tables/projectUsers.sql").toString());

                // views
                db.run(readFileSync("./data/views/vwProjects.sql").toString());

                db.close();

                console.log("Initialised Database");
            })
        }
    }

    public DatabaseExists(): Boolean {
        return existsSync(process.env.SQLITE3_DB);
    }
}