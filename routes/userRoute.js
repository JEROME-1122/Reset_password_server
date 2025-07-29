
const express = require("express");
const getUserData = require("../controller/userController");
const userAuth = require("../middleware/userAuth");

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData); 

module.exports = userRouter;
