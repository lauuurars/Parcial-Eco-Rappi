import express from "express"
import { UsersController } from "./users.controller.js"
import { UsersRepository } from "./users.repository.js"

const router = express.Router()

const repository = new UsersRepository();
const controller = new UsersController(repository);

router.get("/", controller.getAllUsers);

router.post("/", controller.createUser);

router.get("/:id", controller.getUserById);

export default router;
