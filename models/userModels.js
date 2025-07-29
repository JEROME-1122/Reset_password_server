const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyOtp: {
    type: String,
    default: "",
  },
  verifyOtpExpireAt: {
    type: Number,
    default: 0,
  },
  isAccountVerified: {
    type: Boolean, 
    default: false,
  },
  resetOtp: {
    type: Number,
    default: 0, 
  },
  resetOtpExpireAt: {
    type: Number,
    default: 0,
  },
});

const userModels = mongoose.model("user", userSchema);
module.exports = userModels;
