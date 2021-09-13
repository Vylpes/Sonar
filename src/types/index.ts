import { Session } from "express-session";
import { User } from "../entity/User";

declare module 'express-session' {
    interface Session {
        User?: User;
        error?: string;
        success?: string;
    }
}