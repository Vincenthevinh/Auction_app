import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOtpMail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_NAME,
        to: email,
        subject: "Xác minh tài khoản",
        text: `Mã OTP của bạn là: ${otp} (hết hạn sau 5 phút)`
    };
    await transporter.sendMail(mailOptions);
};
