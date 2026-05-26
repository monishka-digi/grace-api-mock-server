const users = require("../data/users.json");

const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/generateToken");


// LOGIN / ACCOUNT-ME
const getAccountMe = async (req, res, next) => {
  try {

    const user = users[0];

    // Generate Access Token
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email
    });

    // Generate Refresh Token
    const refreshToken = generateRefreshToken({
      id: user.id
    });

    res.status(200).json({
      success: true,

      access_token: accessToken,

      refresh_token: refreshToken,

      expires_in: "30m",

      user
    });

  } catch (error) {
    next(error);
  }
};


// REFRESH TOKEN ENDPOINT
const refreshAccessToken = async (req, res, next) => {
  try {

    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    const jwt = require("jsonwebtoken");

    jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {

        if (err) {
          return res.status(403).json({
            success: false,
            message: "Invalid refresh token"
          });
        }

        // NEW ACCESS TOKEN
        const newAccessToken =
          generateAccessToken({
            id: decoded.id
          });

        return res.status(200).json({
          success: true,

          access_token: newAccessToken,

          expires_in: "30m"
        });
      }
    );

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccountMe,
  refreshAccessToken
};