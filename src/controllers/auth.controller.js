import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendOtpMail } from "../utils/sendMail.js";
import passport from "../utils/passport.js";

// Signup + OTP
export const signup = async (req, res) => {
  const { email, password, username } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ msg: "Email đã tồn tại" });

  const hashed = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user = await User.create({
    username,
    email,
    password: hashed,
    otp,
    otpExpires: Date.now() + 5 * 60 * 1000
  });

  await sendOtpMail(email, otp);
  res.json({ msg: "OTP đã gửi!" });
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email, otp });

  if (!user) return res.status(400).json({ msg: "OTP sai!" });
  if (user.otpExpires < Date.now()) return res.status(400).json({ msg: "OTP hết hạn!" });

  user.isVerified = true;
  user.otp = null;
  await user.save();

  res.json({ msg: "Xác minh thành công!" });
};

// Local login
export const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (!user) return res.status(400).json(info);
    req.logIn(user, err => {
      res.json({ msg: "Đăng nhập OK", user });
    });
  })(req, res, next);
};

// Logout
export const logout = (req, res) => {
  req.logout(() => {
    res.json({ msg: "Đã đăng xuất!" });
  });
};
