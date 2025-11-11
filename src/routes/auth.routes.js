import express from "express";
import passport from "../utils/passport.js";
import { signup, verifyOtp, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// Local
router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.get("/logout", logout);

// Facebook OAuth
/*router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback",
  passport.authenticate("facebook", { successRedirect: "/dashboard", failureRedirect: "/" })
);*/  

// Google OAuth
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback",
  passport.authenticate("google", { successRedirect: "/dashboard", failureRedirect: "/" })
);

// Github OAuth
router.get("/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get("/github/callback",
  passport.authenticate("github", { successRedirect: "/dashboard", failureRedirect: "/" })
);

export default router;
