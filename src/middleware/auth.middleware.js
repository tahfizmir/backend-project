// verify if the user is authenticated.
// if verified we add user to req object.
import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _,next)=>{
    try {
        // token from cookies
         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
         // here if dont have cookies is not present eg in some mobile application there is key Authorization in header with value "Bearer <token>" so we are taking token from there.
         if(!token){
            throw new ApiError(401,"Unauthorized request")
         }
         // here token is present now verify
         const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
         // here checking with _id as we declared in userSchema while setting up generateAccessToken method
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw ApiError(401,"Invalid Access Token");
        }
        // now we have user access authenticated , now adding object to req
        req.user=user; // created user object in req and gave it the access of user.
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid access token" )
    }
})