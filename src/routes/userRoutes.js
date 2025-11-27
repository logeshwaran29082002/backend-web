const express = require("express");
const router = express.Router();

// SIGNUP CONTROLLERS
const { signup, verifyOTP, resendOTP, googleLogin } = require("../controllers/userController");

// LOGIN + RESET CONTROLLERS
const { Login, resetPassword, resetpasswordToken, verifyOtp } = require("../controllers/loginController");

// MIDDLEWARE
const { verifyToken } = require("../middleware/auth");

// ---------------- SIGNUP ----------------
router.post("/signup", signup);
router.post("/signup-verify-otp", verifyOTP);   // ✅ renamed (was /verify-otp)
router.post("/resend-otp", resendOTP);

// ---------------- LOGIN ----------------
router.post("/login", Login);

// ---------------- GOOGLE LOGIN ----------------
router.post("/google-login", googleLogin);

// ---------------- TOKEN VERIFY ----------------
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user,
  });
});

// ---------------- RESET PASSWORD ----------------
router.post("/reset-password", resetPassword);

// ✅ RESET PASSWORD OTP VERIFY (separate route)
router.post("/reset-verify-otp", verifyOtp);

// ✅ RESET PASSWORD USING TOKEN
router.post("/reset-password/:token", resetpasswordToken);

module.exports = router;
