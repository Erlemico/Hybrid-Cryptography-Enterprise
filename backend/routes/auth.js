const express = require("express");
const { body } = require("express-validator");
const { login } = require("../controllers/authController");

const router = express.Router();

// Validasi input login
const validateLogin = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Endpoint login
router.post("/login", validateLogin, login);

module.exports = router;