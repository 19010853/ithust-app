import { SignUp } from "@gateway/controllers/auth/signup";
import { SignIn } from "@gateway/controllers/auth/signin";
import { Router } from "express";

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    public routes(): Router {
        this.router.post('/auth/signup', SignUp.prototype.create);
        this.router.post('/auth/signin', SignIn.prototype.read);
        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();