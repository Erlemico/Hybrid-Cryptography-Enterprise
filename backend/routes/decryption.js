const express = require("express");
const { downloadAndDecryptFile, decryptById } = require("../controllers/decryptionController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/decrypt", verifyToken, allowRoles(["CFO", "Auditor", "Employee"]), downloadAndDecryptFile);
router.post("/decrypt-by-id", verifyToken, allowRoles(["CFO", "Auditor", "Employee"]), decryptById);

router.post('/decrypt', downloadAndDecryptFile); // Decrypt and view the result
router.post('/decrypt-by-id', decryptById); // Decrypt and download

module.exports = router;