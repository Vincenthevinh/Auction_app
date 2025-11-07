import express from "express";
const router = express.Router();

router.get("/signin", (req, res) => {
  res.render("auth/signin", {
    title: "Sign In",
    layout: "auth"
  });
});

router.get("/signup", (req, res) => {
  res.render("auth/signup", {
    title: "Sign Up",
    layout: "auth"
  });
});

router.get("/otp", (req, res) => {
  res.render("auth/otp", {
    title: "OTP Verification",
    layout: "auth"
  });
});

export default router;
