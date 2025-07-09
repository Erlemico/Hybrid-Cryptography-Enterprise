const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const encryptionRoutes = require("./routes/index"); // endpoint hybrid crypto
const authRoutes = require("./routes/auth");
const logRequest = require("./middleware/requestLogger");

const app = express();
const PORT = 3000;

// Middleware dasar
app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logRequest);

// View engine
app.set("view engine", "ejs");

// Folder statis
app.use("/encrypted", express.static(path.join(__dirname, "./encrypted")));
app.use("/decrypted", express.static(path.join(__dirname, "./decrypted")));

// Routing utama
app.use("/", encryptionRoutes); // untuk fitur enkripsi awal kamu
app.use("/auth", authRoutes); // login, logout

// Dashboard user login (khusus testing jika pakai cookie)
app.get("/dashboard", (req, res) => {
  res.send("Dashboard endpoint - protected route");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});