import { SignUp } from "@gateway/controllers/auth/signup";
import { Router } from "express";

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    public routes(): Router {
        this.router.post('/auth/signup', SignUp.prototype.create);
        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();