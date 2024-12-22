import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // mongoose.connect return an object.
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`\n MongoDB connected DB host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MONGO DB connection error ", error);
    process.exit(1);
  }
};
export default connectDB;

// async function returns promise
