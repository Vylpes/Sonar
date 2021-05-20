import { Database } from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

export const SetupCatTable = (req: Request, res: Response, next: NextFunction) => {
    const db = new Database('data.db');

    db.serialize(() => {
        const stmt = db.prepare('INSERT INTO cats VALUES (?, ?)');

        for (let i = 0; i < 10; i++) {
            stmt.run(uuidv4(), `cat number ${i}`);
        }

        stmt.finalize();

        db.all("SELECT * from cats WHERE name = 'cat number 1'", (err, rows) => {
            res.locals.catRows = rows;
            next();
        });

        db.close();
    });
};