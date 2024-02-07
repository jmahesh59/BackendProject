import { asyncHandler} from '../utils/asyncHandler.js'
import {ApiError}  from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudnary.js'

import {ApiResponce} from '../utils/ApiResponce.js'

const generateAccessTokenAndRefreshTokens =async (userId)=>{
   try {
      const user = await User.findById(userId)
      const acceessToken= user.generateAccessToken()
      const refreshToken =user.generateRefreshToken()

      user.refreshToken =refreshToken
      await user.save({validateBeforeSave:false})
      return {acceessToken , refreshToken}
   } catch (error) {
      throw new ApiError(500,"something went wrong while generation refresh and aceess token")
   }
}

const registerUser = asyncHandler(async (req,res)=>{
   // get user details from frontend
   //validate user data not empty
   //check if user is already exits: username,email
   //check for images , check for avatar
   //upload them to cloudnary , avatar
   //create user object - create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return response


   // get user details from frontend
    const {fullname,username,email,password}=req.body;
    
   if(
    [fullname,email,username,password].some((field)=>field.trim()==="")
   ) {
      throw new ApiError(400,"All fields are Required")
   }

   const existedUser =await User.findOne({
    $or:[{username},{email}]
   })

   if(existedUser){
    throw new ApiError(409,"User with email or username")
   }
  const avatarLocalPath = req.files?.avatar[0]?.path;
//    console.log(files)

const coverImageLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400,'Avatar file is required')
}

//upload them to cloudnary

 const avatar = await uploadOnCloudinary(avatarLocalPath);
 const coverImage = await uploadOnCloudinary(coverImageLocalPath);


 if(!avatar){
    throw new ApiError(400,'Avatar file is required')
 }

 const user =await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url ||"",
    email,
    password,
    username:username.toLowerCase(),
 })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
 if(!createdUser){
    throw new ApiError(500,"something went wrong registing user")
 }

 return res.status(201).json(
    new ApiResponce(200,createdUser,"User register Successfully")
 )
})

const loginUser = asyncHandler(async (req,res)=>{
   //req body ==data
   //username or email
   //find the user
   //password check
   //acceess and refresh token generate
   //send cookie 


   const {email,username,password} = req.body
   if(!username || !email){
      throw new ApiError(400,"username or email is required")  
   }

   const user =await User.findOne({
      $or:[{username},{email}]
   })
   if(!user){
      throw new ApiError(404,"user doesnot exits")
   }
   const isPasswordValid =await user.isPasswordCorrect(password)
   if(!isPasswordValid){
      throw new ApiError(401,"Invalid user credentials")
   }
   const {acceessToken,refreshToken}=await generateAccessTokenAndRefreshTokens(user._id)

  const loggedInUser =await User.findById(user._id).select("-password -refreshToken")

  const options ={
   httpOnly:true,
   secure:true
  }

  return res.status(200).cookie("accessToken",acceessToken,options).cookie("refreshToken",refreshToken
  ,options).json(
   new ApiResponce(200,{
      user: loggedInUser ,acceessToken,refreshToken
   },"User logged in Successfully"))
})


const logoutUser = asyncHandler(async(req,res)=>{
   User.findByIdAndUpdate(req.user._id,{
      $set:{
         refreshToken:undefined
      }
   },
   {
      new:true
   }
   
   )
   const options ={
      httpOnly:true,
      secure:true
     }

     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponce(200,{},"userlogout successfully"))
})


export {registerUser, loginUser ,logoutUser}