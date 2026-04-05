import express from "express"
import { authController } from "./auth.controller.js";


const router = express.Router()

router.post("/sign-up", authController.signUp)
router.post("/login", authController.login)

export default router;
