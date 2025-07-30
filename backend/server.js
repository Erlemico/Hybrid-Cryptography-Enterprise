const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const mainRoutes = require("./routes");
const logRequest = require("./middleware/requestLogger");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(logRequest);

// View engine
app.set("view engine", "ejs");

// Static folders
app.use("/encrypted", express.static(path.join(__dirname, "./encrypted")));
app.use("/decrypted", express.static(path.join(__dirname, "./decrypted")));

// Main routes
app.use("/api", mainRoutes);

app.set("trust proxy", true);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});