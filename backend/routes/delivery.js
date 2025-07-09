const express = require("express");
const { saveData, getAllData, getById } = require("../controllers/deliveryController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-key", verifyToken, allowRoles(["CFO"]), saveData);
router.get("/get-key", verifyToken, allowRoles(["CFO", "Auditor"]), getAllData);
router.get("/get-key/:id", verifyToken, allowRoles(["CFO", "Auditor", "Employee"]), getById);

router.post('/send-key', saveData); // Send information to db
router.get('/get-key', getAllData); // Get information from db
router.get('/get-key/:id', getById); // Get information from db

module.exports = router;