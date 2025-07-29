const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} = require("../controller/authController");
const userAuth = require("../middleware/userAuth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/sent-verrify-otp", userAuth, sendVerifyOtp);
router.post("/verify-account", userAuth, verifyEmail);
router.get("/is-auth", userAuth, isAuthenticated);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
