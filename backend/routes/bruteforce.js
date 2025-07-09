const express = require("express");
const { simulateBruteForceById } = require("../controllers/bruteforceController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/bruteforce", verifyToken, allowRoles(["CFO", "Auditor"]), simulateBruteForceById);
router.post('/bruteforce', simulateBruteForceById); // Bruteforce to decrypt encrypted file

module.exports = router;