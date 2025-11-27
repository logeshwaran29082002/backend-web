const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    
    // ⚠️ Make password optional (Google login users have no password)
    password: {
      type: String,
      required: false  
    },

    otp: { type: String },
    otpExpireTime: { type: Date },
    isVerified: { type: Boolean, default: false },

    resetpasswordToken: { type: String },
    resetpasswordExpires: { type: Date },

    // ⭐ Google Login fields
    googleAccount: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
