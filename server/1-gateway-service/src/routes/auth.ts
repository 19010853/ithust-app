import { SignUp } from "@gateway/controllers/auth/signup";
import { SignIn } from "@gateway/controllers/auth/signin";
import { VerifyEmail } from "@gateway/controllers/auth/verify-email";
import { Router } from "express";

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    public routes(): Router {
        this.router.post('/auth/signup', SignUp.prototype.create);
        this.router.post('/auth/signin', SignIn.prototype.read);
        this.router.put('/auth/verify-email', VerifyEmail.prototype.update);
        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();