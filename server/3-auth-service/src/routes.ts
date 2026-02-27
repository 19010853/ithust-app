import { Application } from "express";

export function authRoutes(app: Application): void {
    app.use('', () => {
        console.log('Auth routes');
    })
}