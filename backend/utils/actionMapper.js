// utils/actionMapper.js

const actionMap = [
  { method: "POST", path: "/auth/login", action: "LOGIN" },
  { method: "POST", path: "/encryption", action: "ENCRYPT FILE" },
  { method: "POST", path: "/decryption", action: "DECRYPT FILE" },
  { method: "POST", path: "/decryption/by-id", action: "DECRYPT FILE" },
  { method: "POST", path: "/bruteforce", action: "BRUTEFORCE" },
  { method: "GET", path: "/delivery/get-key", action: "GET KEY LIST" },
  { method: "GET", path: "/delivery/get-key/:id", action: "GET KEY BY ID" },
  { method: "GET", path: "/logs/json", action: "VIEW LOG JSON" },
  { method: "GET", path: "/logs/csv", action: "EXPORT LOG CSV" },
];

// Fungsi pencocokan otomatis
function mapToAction(method, path) {
  for (const entry of actionMap) {
    const normalized = entry.path.replace(/:.*?($|\/)/g, "[^/]+"); // ganti :id jadi pattern
    const regex = new RegExp("^" + normalized + "$");
    if (entry.method === method.toUpperCase() && regex.test(path)) {
      return entry.action;
    }
  }
  return "UNKNOWN ACTION";
}

module.exports = { mapToAction };
