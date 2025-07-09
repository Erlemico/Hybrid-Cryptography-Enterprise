import React, { useState } from "react";
import axios from "axios";

const FileEncryptor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError("");
    setResult(null);
    setMessage("");
  };

  // Handle file upload
  const handleEncrypt = async () => {
    if (!selectedFile) {
      setError("Upload file to encrypt!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setError("");
      setResult(null);
      setMessage("");

      // Make API call to encrypt the file
      const response = await axios.post("http://localhost:3000/api/encrypt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const encryptedData = response.data.data; // Extract encrypted data
      setResult(encryptedData); // Set result from the API response
      setMessage(response.data.message); // Set message from backend
      setLoading(false);

      // Automatically push data to /api/send-key
      await sendKeyToAPI(encryptedData);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "An error occurred during encryption.");
    }
  };

  // Function to send key data to /api/send-key
  const sendKeyToAPI = async (data) => {
    try {
      const response = await axios.post("http://localhost:3000/api/send-key", {
        fileName: data.fileName,
        rsaKey: data.rsaKey,
        iv: data.iv,
      });

      console.log("Data successfully pushed to /api/send-key:", response.data);
    } catch (err) {
      console.error("Failed to push data to /api/send-key:", err.response?.data || err.message);
      setError("Failed to push data to /api/send-key. Please try again.");
    }
  };

  // Handle reset state for "Encrypt More"
  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setMessage("");
    setError("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>File Encryption</h1>
      <p style={styles.description}>Upload file to encrypt using AES and RSA algorithms.</p>

      {/* File input */}
      {!result && (
        <input type="file" onChange={handleFileChange} style={styles.fileInput} />
      )}

      {/* Encrypt button */}
      {!result && (
        <button onClick={handleEncrypt} style={styles.button} disabled={loading}>
          {loading ? "Processing..." : "Encrypt File"}
        </button>
      )}

      {/* Error message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Success Message */}
      {message && <p style={styles.success}>{message}</p>}

      {/* Result */}
      {result && (
        <div style={styles.result}>
          <h2 style={styles.resultTitle}>Encryption Result</h2>
          <div style={styles.resultItem}>
            <strong>Encrypted File:</strong>
            <a href={`http://localhost:3000/encrypted/${result.fileName}`} target="_blank" rel="noopener noreferrer" style={styles.link}>
              Download Encrypted File
            </a>
          </div>
          <div style={styles.resultItem}>
            <strong>RSA Key:</strong>
            <p style={styles.resultValue}>{result.rsaKey}</p>
          </div>
          <div style={styles.resultItem}>
            <strong>Initialization Vector (IV):</strong>
            <p style={styles.resultValue}>{result.iv}</p>
          </div>
          <h3 style={styles.performanceTitle}>Performance</h3>
          <div style={styles.resultItem}>
            <strong>Elapsed Time:</strong>
            <p style={styles.resultValue}>{result.performance.elapsedTime}</p>
          </div>
          <div style={styles.resultItem}>
            <strong>Memory Used:</strong>
            <p style={styles.resultValue}>{result.performance.memoryUsed}</p>
          </div>
          <div style={styles.resultItem}>
            <strong>CPU Usage:</strong>
            <p style={styles.resultValue}>{result.performance.cpuUsage}</p>
          </div>
        </div>
      )}

      {/* Encrypt More Button */}
      {result && (
        <button onClick={handleReset} style={styles.button}>
          Encrypt More
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    margin: "20px",
    fontFamily: "'Arial', sans-serif",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  description: {
    fontSize: "1.2rem",
    marginBottom: "20px",
    color: "#555",
  },
  fileInput: {
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginBottom: "20px",
  },
  success: {
    color: "green",
    fontSize: "1rem",
    marginTop: "10px",
  },
  result: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    textAlign: "left",
    maxWidth: "600px",
    margin: "20px auto",
  },
  resultTitle: {
    marginTop: "-10px",
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "10px",
    textAlign: "center",
  },
  resultItem: {
    marginBottom: "10px",
    fontSize: "1.2rem",
  },
  resultValue: {
    fontSize: "1rem",
    color: "#333",
    marginTop: "5px",
    wordWrap: "break-word",
  },
  performanceTitle: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    marginTop: "20px",
    marginBottom: "10px",
    textAlign: "center",
  },
  link: {
    textDecoration: "none",
    color: "#007BFF",
    marginLeft: "10px",
  },
  error: {
    color: "red",
    marginTop: "10px",
    marginBottom: "10px",
  },
};

export default FileEncryptor;