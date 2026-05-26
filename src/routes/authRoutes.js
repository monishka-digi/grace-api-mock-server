const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  getAccountMe,
  refreshAccessToken
} = require("../controllers/authController");


// LOGIN
router.get(
  "/account-me",
  authMiddleware,
  getAccountMe
);


// REFRESH TOKEN
router.post(
  "/refresh-token",
  refreshAccessToken
);

module.exports = router;