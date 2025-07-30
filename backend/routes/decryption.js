const express = require("express");
const {
  downloadAndDecryptFile,
  decryptById,
} = require("../controllers/decryptionController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  allowRoles(["CFO", "Auditor", "Employee"]),
  downloadAndDecryptFile
);
router.post(
  "/by-id",
  verifyToken,
  allowRoles(["CFO", "Auditor", "Employee"]),
  decryptById
);

module.exports = router;