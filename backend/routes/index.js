const express = require('express');
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const { uploadAndEncryptFile } = require('../controllers/encryptionController');
const { downloadAndDecryptFile, decryptById } = require('../controllers/decryptionController');
const { saveData, getAllData, getById } = require('../controllers/deliveryController');
const { simulateBruteForceById } = require('../controllers/bruteforceController');

const router = express.Router();

router.post("/encrypt", verifyToken, allowRoles(["CFO"]), uploadAndEncryptFile);
router.post("/decrypt", verifyToken, allowRoles(["CFO", "Auditor", "Employee"]), downloadAndDecryptFile);
router.post("/decrypt-by-id", verifyToken, allowRoles(["CFO", "Auditor", "Employee"]), decryptById);
router.post("/send-key", verifyToken, allowRoles(["CFO"]), saveData);
router.get("/get-key", verifyToken, allowRoles(["CFO", "Auditor"]), getAllData);
router.get("/get-key/:id", verifyToken, allowRoles(["CFO", "Auditor", "Employee"]), getById);
router.post("/bruteforce", verifyToken, allowRoles(["CFO", "Auditor"]), simulateBruteForceById);






module.exports = router;