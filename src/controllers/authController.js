const db = require("../config/db");

const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/generateToken");

const jwt = require("jsonwebtoken");


// ==========================================
// REGISTER
// ==========================================
const register = async (req, res, next) => {

  try {

    const {
      name,
      email,
      password,
      role
    } = req.body;

    // VALIDATION
    if (!name || !email || !password) {

      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });

    }

    // CHECK USER EXISTS
    const checkQuery =
      "SELECT * FROM users WHERE email = ?";

    db.query(
      checkQuery,
      [email],
      (err, result) => {

        if (err) {
          return next(err);
        }

        // USER ALREADY EXISTS
        if (result.length > 0) {

          return res.status(400).json({
            success: false,
            message: "User already exists"
          });

        }

        // INSERT USER
        const insertQuery = `
          INSERT INTO users
          (name, email, password, role)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          insertQuery,
          [
            name,
            email,
            password,
            role || "user"
          ],
          (err, result) => {

            if (err) {
              return next(err);
            }

            res.status(201).json({
              success: true,
              message: "User registered successfully",

              user: {
                id: result.insertId,
                name,
                email,
                role: role || "user"
              }
            });

          }
        );

      }
    );

  } catch (error) {

    next(error);

  }

};


// ==========================================
// ACCOUNT ME
// ==========================================
const getAccountMe = async (req, res, next) => {

  try {

    const email  = req.headers.email;

    if (!email) {

      return res.status(400).json({
        success: false,
        message: "Email is required"
      });

    }

    // FIND USER
    const query = `
      SELECT id, name, email, role
      FROM users
      WHERE email = ?
    `;

    db.query(
      query,
      [email],
      (err, result) => {

        if (err) {
          return next(err);
        }

        // USER NOT FOUND
        if (result.length === 0) {

          return res.status(404).json({
            success: false,
            message: "User not found"
          });

        }

        const user = result[0];

        // GENERATE ACCESS TOKEN
        const accessToken =
          generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role
          });

        // GENERATE REFRESH TOKEN
        const refreshToken =
          generateRefreshToken({
            id: user.id
          });

        res.status(200).json({
          success: true,

          access_token: accessToken,

          refresh_token: refreshToken,

          expires_in: "30m",

          user
        });

      }
    );

  } catch (error) {

    next(error);

  }

};


// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================
const refreshAccessToken = async (req, res, next) => {

  try {

    const { refresh_token } = req.body;

    if (!refresh_token) {

      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });

    }

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
  register,
  getAccountMe,
  refreshAccessToken
};