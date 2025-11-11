import passport from "passport";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv"; // <-- THÊM: Import dotenv
dotenv.config(); // <-- THÊM: Nạp biến môi trường ngay lập tức

import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";

// ✅ Kiểm tra env
console.log("✅ Loaded ENV:");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID); // Bây giờ sẽ có giá trị
console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID); // Bây giờ sẽ có giá trị

// ✅ Serialize / Deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// ✅ Local Strategy
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: "Email chưa đăng ký" });

    if (!user.isVerified) {
      return done(null, false, { message: "Vui lòng xác minh OTP" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: "Sai mật khẩu" });

    return done(null, user);
  })
);

// ✅ Load Google OAuth only when ENV exists
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log("✅ Google OAuth Enabled");
  passport.use(
  new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async (_, __, profile, done) => {
        let user = await User.findOne({
          provider: "google",
          providerId: profile.id,
        });
        if (!user) {
          user = await User.create({
            username: profile.displayName,
            email: profile.emails?.[0]?.value,
            provider: "google",
            providerId: profile.id,
            isVerified: true,
          });
        }
        return done(null, user);
      }
    )
  );
} else {  
  console.log("❌ Google ENV missing → OAuth disabled");
}

// ✅ Load Github OAuth only when ENV exists
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log("✅ Github OAuth Enabled");
  passport.use(
  new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback",
      },
      async (_, __, profile, done) => {
        let user = await User.findOne({
          provider: "github",
          providerId: profile.id,
        });
        if (!user) {
          user = await User.create({
            username: profile.displayName || profile.username,
            email: profile.emails?.[0]?.value || null,
            provider: "github",
            providerId: profile.id,
            isVerified: true,
          });
        }
        return done(null, user);
      }
    )
  );
} else {
  console.log("❌ Github ENV missing → OAuth disabled");
}

export default passport;