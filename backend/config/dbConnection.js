import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Coonected Successfully ✅");
  } catch (error) {
    console.log("DB Connection Error", error);
  }
};
