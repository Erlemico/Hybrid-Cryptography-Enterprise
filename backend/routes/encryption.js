const express = require("express");
const { uploadAndEncryptFile } = require("../controllers/encryptionController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, allowRoles(["CFO", "Employee"]), uploadAndEncryptFile);

module.exports = router;