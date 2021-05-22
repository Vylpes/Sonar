import { Session } from "express-session";

declare module 'express-session' {
    interface Session {
        userId?: string;
        userEmail?: string;
        userName?: string;
        error?: string;
        success?: string;
    }
}