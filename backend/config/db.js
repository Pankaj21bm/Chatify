import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const mongoConnect = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB is connected: ${mongoConnect.connection.host}`.magenta.underline
    );
  } catch (error) {
    console.log(`Error : ${error.message}`);
    process.exit();
  }
};
export default connectDB;
