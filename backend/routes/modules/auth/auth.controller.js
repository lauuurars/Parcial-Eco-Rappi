import { userRepository } from "../users/users.repository.js";
import { authRepository } from "./auth.repository.js";

class AuthController {

    constructor(repository) {
        this.repository = repository;
    }

    signUp = async (req, res) => {
        try {
            const result = await this.repository.signUp(req.body);
            res.send({ result })
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    }

    login = async (req, res) => {
        try {
            const result = await this.repository.login(req.body);
            res.send({ result })
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    }
}

export const authController = new AuthController(authRepository);