import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";

import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:2
        }
    ]),
    registerUser
    )
router.route("/login").post(loginUser)

//secuar routes

router.route("/logout").post(verifyJWT, loginUser)

export default router;