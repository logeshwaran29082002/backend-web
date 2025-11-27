const nodemailer = require("nodemailer");

const sentOtp = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your OTP Verification Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`
  });
};

module.exports = sentOtp;
