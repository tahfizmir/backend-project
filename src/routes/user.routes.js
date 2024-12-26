import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)  // this register is suffix of the url from the middleware it is accessed from  eg users/register

export default router