const express = require("express");
const {
  generateToken,
  validateToken,
  getAllTokens,
  resendToken,
} = require("../controllers/tokenController");

const router = express.Router();

router.post("/", generateToken);
router.get("/", getAllTokens);
router.get("/validate/:token", validateToken);
router.put("/resend/:id", resendToken);

module.exports = router;