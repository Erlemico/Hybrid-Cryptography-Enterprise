const express = require("express");
const router = express.Router();
const logsController = require("../controllers/logsController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const logRequest = require("../middleware/requestLogger");

router.get("/json", logRequest, verifyToken, allowRoles(["CFO", "Auditor"]), logsController.getLogsJson);
router.get("/csv", verifyToken, allowRoles(["CFO", "Auditor"]), logsController.getLogsCsv);

module.exports = router;