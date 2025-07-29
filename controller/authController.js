require("dotenv").config();
const userModels = require("../models/userModels");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const transporter = require("../config/nodemail");

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required." });
    }

    const userExists = await userModels.findOne({ email });

    if (userExists) {
      return res.json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModels.create({
      name,
      email,
      password: hashedPassword,
      isAccountVerified: false,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      success: true,
      message: "Registration successful. Please verify your email.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAccountVerified: newUser.isAccountVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "User details required" });
  }

  try {
    const user = await userModels.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Password incorrect" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "User Logged In",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong", error });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: true, message: "User Logged Out" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//email verification

const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModels.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already verified " });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your Otp is ${otp} . Verify your account using this OTP`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Verification Otp Send On Email " });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing userId or OTP" });
  }

  try {
    const user = await userModels.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.verifyOtp || user.verifyOtp !== String(otp).trim()) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "User verified successfully" });
  } catch (error) {
    console.error("Verify Email Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const isAuthenticated = async (req, res) => {
  try {
    res.json({ success: true, message: "user verified " });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is Required" });
  }

  try {
    const user = await userModels.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset password OTP",
      text: `Your Otp is ${otp} . Reset your password this OTP`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Reset Otp Send On Email " });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "Email, Otp, new Passowrd  are required",
    });
  }
  try {
    const user = await userModels.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    // console.log(email);
    // console.log(user._id)
    // console.log(otp);
    // console.log(user.resetOtp);

    if (!user.resetOtp || user.resetOtp.toString() !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date(user.resetOtpExpireAt).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    const hasedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hasedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    res.json({ success: true, message: "password reset successfully " });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
};
