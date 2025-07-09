import React, { useState } from "react";
import GetAllKeys from "./getAllInformation";
import GetKeyById from "./getInformationById";

const Information = () => {
  const [showGetAllKeys, setShowGetAllKeys] = useState(false);
  const [showGetKeyById, setShowGetKeyById] = useState(false);

  const toggleGetAllKeys = () => {
    setShowGetAllKeys(!showGetAllKeys);
    setShowGetKeyById(false);
  };

  const toggleGetKeyById = () => {
    setShowGetKeyById(!showGetKeyById);
    setShowGetAllKeys(false);
  };

  return (
    <div style={styles.page}>
      <h2>Information</h2>
      <p style={styles.description}>This page contains information about files that have been encrypted.</p>

      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={toggleGetAllKeys}>
          {showGetAllKeys ? "Hide All Information" : "Get All Information"}
        </button>
        <button style={styles.button} onClick={toggleGetKeyById}>
          {showGetKeyById ? "Hide Get Information By ID" : "Get Information By ID"}
        </button>
      </div>

      {/* Tampilkan GetAllKeys jika tombol diklik */}
      {showGetAllKeys && (
        <div style={styles.tableContainer}>
          <GetAllKeys />
        </div>
      )}

      {/* Tampilkan GetKeyById jika tombol diklik */}
      {showGetKeyById && (
        <div style={styles.formContainer}>
          <GetKeyById />
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    textAlign: "center",
    marginTop: "-10px",
    fontSize: "1.5rem",
  },
  description: {
    marginTop: "-15px",
    fontSize: "1.2rem",
    marginBottom: "20px",
    color: "#555",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
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
  link: {
    textDecoration: "none",
  },
  formContainer: {
    marginTop: "30px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
  },
  tableContainer: {
    marginTop: "30px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
  },
};

export default Information;