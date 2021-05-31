import { readFileSync } from "fs";
import mysql from "mysql2";

export class DatabaseHelper {
    public createConnection(): mysql.Connection {
        const connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: 3306,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        return connection;
    }

    public init() {
        const connection = this.createConnection();
        connection.connect();

        // tables
        connection.query(readFileSync("./data/tables/users.sql").toString());
        connection.query(readFileSync("./data/tables/projects.sql").toString());
        connection.query(readFileSync("./data/tables/projectUsers.sql").toString());

        // views
        connection.query(readFileSync("./data/views/vwProjects.sql").toString());
        connection.query(readFileSync("./data/views/vwProjectUsers.sql").toString());

        connection.end();

        console.log("Initialised Database");
    }
}