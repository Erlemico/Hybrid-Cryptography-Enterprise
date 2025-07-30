const express = require("express");
const router = express.Router();

// Prefix router per modul
router.use("/auth", require("./auth"));
router.use("/encrypt", require("./encryption"));
router.use("/decrypt", require("./decryption"));
router.use("/delivery", require("./delivery"));
router.use("/bruteforce", require("./bruteforce"));
router.use("/logs", require("./logs"));

module.exports = router;