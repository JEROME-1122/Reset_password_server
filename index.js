const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const app = express();
const connectDB = require("./config/mogodb");
const router = require("./routes/authroute");
const userRouter = require("./routes/userRoute");
const PORT = process.env.PORT || 3000;

connectDB();


const allowedOrigins=['https://reset-pass-wo-rd.netlify.app/',]
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API working");
});

app.use("/api/auth", router);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
