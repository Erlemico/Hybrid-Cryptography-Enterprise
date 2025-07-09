// const path = require("path");
// const { Log } = require("../models");

// async function downloadFile(req, res) {
//   const user = req.user;
//   const filename = req.params.name;

//   if (!filename) {
//     await Log.create({
//       username: user.username,
//       role: user.role,
//       filename: "N/A",
//       action: "download",
//       status: "failed",
//     });
//     return res.status(400).json({ message: "File not specified" });
//   }

//   // Validasi role (hanya CFO & Auditor yang diperbolehkan)
//   if (!["CFO", "Auditor"].includes(user.role)) {
//     await Log.create({
//       username: user.username,
//       role: user.role,
//       filename,
//       action: "download",
//       status: "failed",
//     });
//     return res.status(403).json({ message: "Forbidden: Role not allowed" });
//   }

//   const filePath = path.join(__dirname, "..", "files", filename);

//   res.download(filePath, async (err) => {
//     const status = err ? "failed" : "success";
//     await Log.create({
//       username: user.username,
//       role: user.role,
//       filename,
//       action: "download",
//       status,
//     });

//     if (err) {
//       return res.status(500).json({ message: "Failed to download file" });
//     }
//   });
// }

// module.exports = { downloadFile };

// const { insertLog } = require("../models/logs");

const path = require("path");

async function downloadFile(req, res) {
  const user = req.user;
  const filename = req.params.name;

  if (!filename) {
    console.log(
      `[FAILED] ${user.username} (${user.role}) file name not provided`
    );
    return res.status(400).send("File not found");
  }

  if (!["CFO", "Auditor"].includes(user.role)) {
    const logMessage = `[FORBIDDEN] ${user.username} (${user.role}) tried to access ${filename}`;
    console.log(logMessage);
    return res.status(403).json({ message: "Forbidden: Access denied" });
  }

  const filePath = path.join(__dirname, "..", "encrypted", filename);

  res.download(filePath, (err) => {
    if (err) {
      console.log(
        `[FAILED] ${user.username} (${user.role}) failed to download ${filename}`
      );
      return res.status(500).send("Failed to download file");
    }

    console.log(
      `[SUCCESS] ${user.username} (${user.role}) downloaded ${filename}`
    );
  });
}

module.exports = { downloadFile };