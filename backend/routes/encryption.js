const express = require("express");
const authRoutes = require("./auth");
const encryptionRoutes = require("./encryption");
const decryptionRoutes = require("./decryption");
const deliveryRoutes = require("./delivery");
const bruteforceRoutes = require("./bruteforce");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/", encryptionRoutes);
router.use("/", decryptionRoutes);
router.use("/", deliveryRoutes);
router.use("/", bruteforceRoutes);

module.exports = router;