const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized. Please login again from start.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized. Please login again.",
    });
  }
};

module.exports = userAuth;
