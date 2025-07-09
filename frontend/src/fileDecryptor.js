import React, { useState } from "react";
import axios from "axios";

const FileDecryptor = () => {
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle decryption
  const handleDecrypt = async () => {
    const parsedId = parseInt(id, 10);
    if (!parsedId || parsedId <= 0) {
      setError("Enter a valid ID!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      setMessage("");

      // Make API call to decrypt the file by ID
      const response = await axios.post("http://localhost:3000/api/decrypt-by-id", { id: parsedId });

      setResult(response.data.data); // Set result from respons API
      setMessage(response.data.message); // Set message from respons API
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "An error occurred during decryption.");
    }
  };

  // Handle reset state for "Decrypt More"
  const handleReset = () => {
    setId("");
    setResult(null);
    setMessage("");
    setError("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>File Decryption</h1>
      <p style={styles.description}>Enter the file ID to decrypt and retrieve the decrypted file.</p>

      {/* File ID Input and Decrypt Button */}
      {!result && (
        <div style={styles.inputContainer}>
          <label htmlFor="id" style={styles.label}>Enter File ID:</label>
          <input type="number" id="id" value={id} onChange={(e) => setId(e.target.value)} min="1" style={styles.input} />
          <button onClick={handleDecrypt} style={styles.button} disabled={loading}>
            {loading ? "Decrypting..." : "Decrypt File"}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Success Message */}
      {message && <p style={styles.success}>{message}</p>}

      {/* Result */}
      {result && (
        <div style={styles.result}>
          <h2 style={styles.resultTitle}>Decryption Result</h2>
          <div style={styles.resultItem}>
            <strong>Decrypted File:</strong>
            <a href={`http://localhost:3000${result.decryptedFilePath}`} target="_blank" rel="noopener noreferrer" style={styles.link}>
              View Decrypted File
            </a>
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

      {/* Decrypt More Button */}
      {result && (
        <button onClick={handleReset} style={styles.button}>
          Decrypt More
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
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "200px",
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
  },
  result: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    textAlign: "left",
    maxWidth: "400px",
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
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    fontSize: "1.2rem",
  },
  resultValue: {
    fontSize: "1.2rem",
    color: "#333",
    marginLeft: "10px",
    wordWrap: "break-word",
  },
  performanceTitle: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    marginTop: "20px",
    marginBottom: "10px",
    textAlign: "center",
  },
  error: {
    color: "red",
    marginTop: "10px",
    marginBottom: "10px",
  },
  success: {
    color: "green",
    fontSize: "1rem",
    marginTop: "10px",
  },
  link: {
    textDecoration: "none",
    color: "#007BFF",
    marginLeft: "10px",
  },
};

export default FileDecryptor;