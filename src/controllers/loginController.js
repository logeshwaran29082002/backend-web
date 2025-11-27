const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const hashed = require('../utils/hashPassword')
const nodemailer = require("nodemailer");
const Login = async (req, res) => {
  try {
    const { email,password } = req.body;

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

// reset password

const resetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "user not found" });
  }
  const token = Math.random().toString(36).slice(-6);
  user.resetpasswordToken = token;
  user.resetpasswordExpires = Date.now() + 3600000; // 1hour

  await user.save();

  const transporater = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "logeshwaran2982@gmail.com",
      pass: "cxwm exok ptdf alcj",
    },
  });

  const message = {
    from: "logeshwaran2982@gmail.com",
    to: user.email,
    subject: "password reset request",
    text: `you are receving this email  because you (or someone else ) has requested a password  reset  for your account. \n\n please use the token  to reset you password: ${token} \n\n If you did the password reset , please ignore this email.`,
  };
  transporater.sendMail(message,(err,info)=>{
    if(err){
      res.status(404).json({message:"something went wrong . Try again later!"})
    }
   res.status(200).json({
    message: "Password reset email sent successfully",
    token
});

  });
};
// verify otp 
const verifyOtp = async (req, res) => {
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
};


// reset password verify 
 
const resetpasswordToken = async (req,res)=>{
  const {token} = req.params;
  const {password} = req.body;
  const user = await User.findOne({
    resetpasswordToken :token,
    resetpasswordExpires :{$gt :Date.now()},
  });
  if(!user){
    res.status(404).json({message:"Invalied token"})
  }
  const hashedpassword = await bcrypt.hash(password,10);
  user.password = hashedpassword;
  user.resetpasswordToken=null;
  user.resetpasswordExpires=null;

  await user.save();

  res.status(201).json({message:"Password reset sucessfully"})
}
module.exports = { Login, resetPassword , resetpasswordToken , verifyOtp};
