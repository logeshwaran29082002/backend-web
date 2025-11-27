const User = require("../models/userSchema");
const hashpassword = require("../utils/hashPassword");
const sentOtp = require("../utils/sendOtp");
const generateToken = require("../utils/generateToken");

// ---------------- SIGNUP -----------------
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await hashpassword(password);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpire = Date.now() + 5 * 60 * 1000;

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashed,
      otp,
      otpExpireTime: otpExpire,
      isVerified: false,
    });

    await newUser.save(); // ✅ DB STORE

    // ✅ FRONTEND RESPONSE FIRST
    res.status(201).json({
      message: "Signup successful",
      userId: newUser._id,
    });

    // ✅ OTP SEND IN BACKGROUND (DEPLOY SAFE)
    sentOtp(newUser.email, otp)
      .then(() => console.log("✅ OTP sent to:", newUser.email))
      .catch((err) => {
        console.error("❌ OTP send failed:", err.message);
      });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });
  }
};

// ---------------- VERIFY OTP -----------------
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "userId and OTP required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.email.endsWith("@gmail.com")) {
      return res.status(400).json({ message: "Only Gmail email IDs are allowed" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (Date.now() > user.otpExpireTime) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpireTime = undefined;
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("verifyOTP error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ---------------- RESEND OTP -----------------
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpire = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otpExpireTime = otpExpire;
    await user.save();

    sentOtp(user.email, otp)
      .then(() => console.log("✅ Resent OTP to:", user.email))
      .catch((err) => console.error("❌ Resend OTP failed:", err.message));

    return res.status(200).json({ message: "OTP resent successfully" });

  } catch (err) {
    console.error("resendOTP error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ---------------- GOOGLE LOGIN -----------------
const googleLogin = async (req, res) => {
  try {
    const { name, email, picture } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        password: null,
        googleAccount: true,
        isVerified: true,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Google login success",
      token,
      user,
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// EXPORT ALL
module.exports = {
  signup,
  verifyOTP,
  resendOTP,
  googleLogin,
};
