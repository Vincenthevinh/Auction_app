// src/routes/auth.routes.js
import express from 'express';
import passport from 'passport';
import { showSignup, postSignup, showLogin, postLogin, showOtp, verifyOtp, logout } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/signup', showSignup);
router.post('/signup', postSignup);

router.get('/login', showLogin);
router.post('/login', postLogin); // passport used inside controller

router.get('/otp', showOtp); // page to enter OTP
router.post('/otp/verify', verifyOtp);

router.get('/logout', logout);

export default router;
