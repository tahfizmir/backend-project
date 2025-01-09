import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};
const extractPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  return fileName.split(".")[0]; // Remove the file extension
};

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // since we are saving the refreshToken only and not the other parameters like password which is required to prevent error we put validateBeforeSave:false
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access or refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  // if(fullName===""){
  //   ApiError(400,"fullName is required")
  // }
  // another way to do the above for all the fields
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    // here "some" loops over the array and return true if any of the fields is empty
    throw new ApiError(400, "all fields are necessary");
  }

  // check if already present is the db

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "already existing user (email or username)");
  }

  console.log("Received files:", req.files);

  if (!req.files || !req.files.avatar || !req.files.avatar[0]) {
    throw new ApiError(400, "Avatar file is required");
  }
  // avatar check and images check
  // console.log("hihoh",avatar);

  //req.files from upload middleware
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath =  req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  // upload to cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file not found");
  }

  // entry to database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id)?.select(
    "-password -refreshToken"
  ); // not sending password and refreshtoken
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exist ");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // not sending password with user
  // sending cookies
  const options = {
    httpOnly: true, // now cookies can be modified by server only
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // clearing cooking
  // resetting refresh token
  // as defined in routes this method gets executed after verifyJWT method. the verifyJWT method adds user object to the req. so now we have user access in the req
  // now we access that user and delete its refreshToken from db to logout.
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  // also clear the cookies add send that response
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

// refreshToken (in our db) se accessToken ko refresh karna.
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorised request");
  }
  try {
    const decodedToken = jwt.verifyJWT(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // incoming refreshToken  ko decode kiya using secret key and us se id li aur usse user mila
    const user = await User.findById(decodedToken?._id);
    // agar woh user exist karta hai to
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    // first match the incoming refreshToken the give the access i.e accessToken
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    // sending new access token in cookies.
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // we wont verify here but use our auth middleware before executing this method in the routes
  const { oldPassword, newPassword } = req.body; // yeh oldPassword and newPassword user dega request mai.
  // auth middleware chala hai means req.user ke pass user hai as we added it in that
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return;
  res.status(200).json(200, req.user, "current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  // updating both
  if (!fullName && !email) {
    throw new ApiError(400, "atleast one fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }
  const uuser = await User.findById(req.user?._id);
  const oldAvatarUrl = uuser.avatar;
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");
  if (oldAvatarUrl) {
    try {
      const publicId = extractPublicIdFromUrl(oldAvatarUrl); // Function to get Cloudinary public ID
      await deleteFromCloudinary(publicId); // Function to delete the image from Cloudinary
    } catch (error) {
      console.error("Error deleting old avatar:", error);
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfullly"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file is missing");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing in params");
  }
  const channel = User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(), // matlab yeh chahiye jisme username ka specified value ho.jo humne params se nikala.
      },
    },
    {
      // my subscribers
      $lookup: {
        from: "subscriptions", // model name as it gets converted to lower case and plural
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      // how many subscribed.
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      // send additional fields with the user object
      $addFields: {
        subscribersCount: {
          $size: $subscribers,
        },
        channelsSubscribedToCount: {
          $size: subscribedTo,
        },
        // if the user is subscribed to  for displaying the subscribe button text
        isSubscribed: {
          // condition
          $cond: {
            // checking if user id is in subscribers list of channel i.e
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // choosing the values i want to send
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exist");
  }
  // channel is an array of object // here it will contain only info about one user that we matched
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
        // here we are converting to ObjectId becoz in aggregate mongoose does not directly work so req.user._id return an id like 123fasrwrfasr but not the ObjectId(123fasrwrfasr) which is the mongoDb id, at other places outside aggregate, mongoose automatically converts the id to mongoDB obj id.
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{ 
                $project: {
                  fullName:1,
                  username:1,
                  avatar:1,
              }   
            }],
            },
          },
          {
            $addFields:{
              // this will overwrite the existing onwer
              owner:{
                // owner array ka first value
                $first:"$owner"
              }
            }
          }
        ],
      },
    },
  ]);
  return res
  .status(200)
  .json(
    new ApiResponse(200,user[0].watchHistory,
      "Watch history fetched successfully"
    )
  )
});

export {
  registerUser,
  updateUserCoverImage,
  updateUserAvatar,
  updateAccountDetails,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
};
