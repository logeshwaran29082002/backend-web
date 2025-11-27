const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const nodemailer = require("nodemailer");

// ---------------- LOGIN ----------------
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({ token });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login error" });
  }
};

// ---------------- RESET PASSWORD (SEND TOKEN) ----------------
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = Math.random().toString(36).slice(-6);

    user.resetpasswordToken = token;
    user.resetpasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password reset request",
      text: `You requested a password reset.\n\nYour reset token is: ${token}\n\nIf you did not request this, ignore this email.`,
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.error("Reset mail error:", err);
        return res.status(500).json({
          message: "Something went wrong. Try again later!",
        });
      }

      return res.status(200).json({
        message: "Password reset email sent successfully",
        token,
      });
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- VERIFY RESET OTP ----------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetpasswordToken: otp,
      resetpasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.status(200).json({ message: "OTP Verified" });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- RESET PASSWORD USING TOKEN ----------------
const resetpasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetpasswordToken: token,
      resetpasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    user.password = hashedpassword;
    user.resetpasswordToken = null;
    user.resetpasswordExpires = null;

    await user.save();

    return res.status(201).json({
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset token error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  Login,
  resetPassword,
  resetpasswordToken,
  verifyOtp,
};
