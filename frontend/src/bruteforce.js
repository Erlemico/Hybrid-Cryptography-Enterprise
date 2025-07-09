import React, { useState } from "react";
import axios from "axios";

const BruteForceSimulator = () => {
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle brute-force simulation
  const handleSimulate = async () => {
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

      const response = await axios.post("http://localhost:3000/api/bruteforce", { id: parsedId });

      setResult(response.data.data);
      setMessage(response.data.message);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "An error occurred during brute-force simulation.");
    }
  };

  // Reset form for new simulation
  const resetSimulation = () => {
    setId("");
    setResult(null);
    setMessage("");
    setError("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Brute Force Simulator</h1>
      <p style={styles.description}>Simulate brute-force to decrypt file by entering it's ID.</p>

      {/* File ID Input and Simulate Button */}
      <div style={styles.inputContainer}>
        <label htmlFor="id" style={styles.label}>Enter File ID:</label>
        <input type="number" id="id" value={id} onChange={(e) => setId(e.target.value)} min="1" style={styles.input}/>
        <button onClick={handleSimulate} style={styles.button} disabled={loading}>
          {loading ? "Simulating..." : "Brute Force"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Success Message */}
      {message && <p style={styles.success}>{message}</p>}

      {/* Result */}
      {result && (
        <div style={styles.result}>
          <h2 style={styles.resultTitle}>Bruteforce Result</h2>
          <div style={styles.resultItem}>
            <strong>Found Key:</strong>
            <span style={styles.inlineValue}>{result.foundKey}</span>
          </div>
          <div style={styles.resultItem}>
            <strong>Bruteforced File:</strong>
            <a href={`http://localhost:3000/decrypted/${result.decryptedFilePath}`} target="_blank" rel="noopener noreferrer" style={styles.link}>
              View Bruteforce File
            </a>
          </div>
        </div>
      )}

      {/* Reset Button */}
      {result && (
        <button onClick={resetSimulation} style={styles.button}>
          Brute Force More
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
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginTop: "-10px",
    marginBottom: "10px",
    textAlign: "center",
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    marginLeft: "5px",
    fontSize: "1.2rem",
    marginBottom: "10px",
  },  
  inlineValue: {
    marginLeft: "10px",
    fontSize: "1rem",
    color: "#333",
  },
  success: {
    color: "green",
    fontSize: "1rem",
    marginTop: "10px",
  },
  error: {
    color: "red",
    marginTop: "10px",
    marginBottom: "10px",
  },
  link: {
    textDecoration: "none",
    color: "#007BFF",
    marginLeft: "10px",
  },
};

export default BruteForceSimulator;