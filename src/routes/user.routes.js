import { Router } from "express";
import { loginUser, registerUser , logoutUser, refreshAccessToken} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1

    }
]),registerUser)  // this register is suffix of the url from the middleware it is accessed from  eg users/register

router.route("/login").post(loginUser)


// secured routes , user logged in hona chahiye

router.route("/logout").post(verifyJWT, logoutUser) // do method like hai isiliye next likhte hai warna router confuse hota hai pehle konsa run karna hai 
router.route("/refresh-route").post(refreshAccessToken) // verify wagiara sab method ke ander hi kiya hai 

export default router