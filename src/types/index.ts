import { Session } from "express-session";

declare module 'express-session' {
    interface Session {
        user: {
            userId: string;
            email: string;
            username: string;
            admin: boolean;
            verified: boolean;
        }
        error?: string;
        success?: string;
    }
}