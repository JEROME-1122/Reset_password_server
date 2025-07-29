
const userModels = require("../models/userModels");

const getUserData = async (req, res) => {
  try {
    const userId = req.userId; 
    const user = await userModels.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = getUserData;
