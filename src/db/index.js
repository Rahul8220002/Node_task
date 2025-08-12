import mongoose from "mongoose";

const mongodbConnection = async () => {
  try {
    const mongodb = await mongoose.connect(process.env.MONGODB_URL);
    console.log("mongodb connecting", mongodb.connection.host);
  } catch (error) {
    console.log("mongoDb connnection failed", error);
    process.exit(1);
  }
};

export default mongodbConnection;
