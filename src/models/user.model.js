import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, required: true, unique: true },
  password: String,
  provider: { type: String, default: "local" }, // local | facebook | google | github
  providerId: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
});

export default mongoose.model("User", userSchema);
