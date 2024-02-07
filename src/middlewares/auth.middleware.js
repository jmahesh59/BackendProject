import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJWT   = asyncHandler(async(req,res,next)=>{
try {
       const token = req.cookies?.accessTOken || req.header("Authorization")?.replace("Bearer ","")
    
       if(!token){
        throw new ApiError(401,"unauthrorized requst")
       }
    
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
       const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
       if(!user){
        throw new ApiError(401,"invalid Access TOken")
       }
       req.user =user;
       next();
    
} catch (error) {

    throw new ApiError(401,error?.message || "invalid access token ")
}
})