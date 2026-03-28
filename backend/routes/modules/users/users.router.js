import express from "express"
import { UsersController } from "./users.controller.js"
import { UsersRepository } from "./users.repository.js"

const router = express.Router()

const repository = new UsersRepository();
const controller = new UsersController(repository);

router.post("/", controller.createUser);

router.get("/users", controller.getAllUsers);

router.get("/:id", controller.getUserById);

export default router;
