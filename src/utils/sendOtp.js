const nodemailer = require("nodemailer");

const sentOtp = async (toEmail, otp) => {
  try {
    // ✅ Transporter creation
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Verify connection before sending (important for Render)
    await transporter.verify();

    // ✅ Send mail
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Your OTP Verification Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    console.log("✅ OTP Mail sent successfully:", info.response);

  } catch (error) {
    console.error("❌ Error sending OTP mail:", error.message);
    throw new Error("OTP mail failed");
  }
};

module.exports = sentOtp;
