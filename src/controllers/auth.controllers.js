// src/controllers/auth.controller.js
import knex from '../../db/knex.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import passport from 'passport';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function showSignup(req, res) {
  res.render('auth/signup', { error: req.session.error });
}

export async function postSignup(req, res) {
  try {
    const { username, email, fullname, address, password } = req.body;
    // basic validation
    if (!username || !email || !password) return res.render('auth/signup', { error: 'Thiếu trường bắt buộc' });

    // check duplicate
    const ex = await knex('users').where('email', email).orWhere('username', username).first();
    if (ex) return res.render('auth/signup', { error: 'Username hoặc email đã tồn tại' });

    const password_hash = await bcrypt.hash(password, 10);
    const [userId] = await knex('users').insert({
      username, email, fullname, address, password_hash, email_verified: false
    }).returning('id');

    // create OTP
    const otp = ('' + Math.floor(100000 + Math.random() * 900000));
    const expires_at = new Date(Date.now() + OTP_TTL_MS);
    await knex('otps').insert({ user_id: userId, otp_code: otp, expires_at, used: false });

    // send OTP email (nodemailer)
    await sendOtpEmail(email, otp);

    // store in session to show OTP page
    req.session.signupUserId = userId;
    res.redirect('/auth/otp');
  } catch (err) {
    console.error(err);
    res.render('auth/signup', { error: 'Lỗi server' });
  }
}

export function showLogin(req, res) {
  res.render('auth/login', { error: req.session.error });
}

export function postLogin(req, res, next) {
  // use passport.authenticate with custom callback to show error on UI
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render('auth/login', { error: info?.message || 'Đăng nhập thất bại' });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/'); // success
    });
  })(req, res, next);
}

export function showOtp(req, res) {
  if (!req.session.signupUserId) return res.redirect('/auth/signup');
  res.render('auth/otp', { userId: req.session.signupUserId });
}

export async function verifyOtp(req, res) {
  try {
    const { otp } = req.body;
    const userId = req.session.signupUserId;
    if (!userId) return res.redirect('/auth/signup');

    const row = await knex('otps').where({ user_id: userId, otp_code: otp, used: false }).andWhere('expires_at', '>', new Date()).first();
    if (!row) return res.render('auth/otp', { error: 'OTP không hợp lệ hoặc đã hết hạn' });

    await knex('otps').where({ id: row.id }).update({ used: true });
    await knex('users').where({ id: userId }).update({ email_verified: true });
    delete req.session.signupUserId;

    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('auth/otp', { error: 'Lỗi server' });
  }
}

export function logout(req, res) {
  req.logout(() => {
    req.session.destroy(() => res.redirect('/'));
  });
}

/* helper send email (nodemailer) */
async function sendOtpEmail(to, otp) {
  // configure transporter (suggest using .env for credentials)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@example.com',
    to,
    subject: 'OTP xác thực tài khoản',
    text: `Mã OTP của bạn: ${otp} (hết hạn sau 10 phút)`
  });
}
