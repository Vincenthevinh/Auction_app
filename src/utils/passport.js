import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import knex from "../../db/knex.js";

// Local Strategy: cho phép đăng nhập bằng email hoặc username
passport.use(new LocalStrategy({
  usernameField: "identifier", // field nhập email/username
  passwordField: "password"
}, async (identifier, password, done) => {
  try {
    // Tìm theo email hoặc username
    const user = await knex("users")
      .where("email", identifier)
      .orWhere("username", identifier)
      .first();

    if (!user) {
      return done(null, false, { message: "Tài khoản không tồn tại!" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return done(null, false, { message: "Sai mật khẩu!" });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Lưu user vào session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Lấy user từ session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await knex("users").where({ id }).first();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
