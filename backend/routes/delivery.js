const express = require("express");
const { saveData, getAllData, getById } = require("../controllers/deliveryController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/get-key", verifyToken, allowRoles(["CFO", "Auditor"]), getAllData);
router.get("/get-key/:id", verifyToken, allowRoles(["CFO", "Auditor", "Employee"]), getById);

module.exports = router;