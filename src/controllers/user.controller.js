import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  // if(fullName===""){
  //   ApiError(400,"fullName is required")
  // }
  // another way to do the above for all the fields
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    // "some" loops over the array and return true if any of the fields is empty
    throw new ApiError(400, "all fields are necessary");
  }

  // check if already present is the db

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "already existing user (email or username)");
  }

  // avatar check and images check

  // req.files from upload middleware
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload to cloudinary

  const avatar=await uploadOnCloudinary(avatarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)
  if(!avatar){
    throw new ApiError(400,"Avatar file not found")
  }

  // entry to database
  User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

  })
  // 
  const createdUser=await User.findById(user._id)?.select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering user")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )

});

export { registerUser };
