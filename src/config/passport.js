// src/config/passport.js
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import knex from '../../db/knex.js';

export default function(passport) {
  passport.use(new LocalStrategy(
    { usernameField: 'login', passwordField: 'password' },
    async (login, password, done) => {
      try {
        const user = await knex('users').where('email', login).orWhere('username', login).first();
        if (!user) return done(null, false, { message: 'Không tìm thấy tài khoản' });
        if (!user.email_verified) return done(null, false, { message: 'Chưa xác thực email' });
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return done(null, false, { message: 'Sai mật khẩu' });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await knex('users').where({ id }).first();
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}
