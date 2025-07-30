const express = require("express");
const {
  simulateBruteForceById,
} = require("../controllers/bruteforceController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  allowRoles(["CFO", "Auditor"]),
  simulateBruteForceById
);

module.exports = router;