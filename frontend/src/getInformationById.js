import React, { useState } from "react";
import axios from "axios";

const GetKeyById = () => {
    const [id, setId] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch data by ID
    const fetchDataById = async () => {
        const parsedId = parseInt(id, 10);
        if (!parsedId || parsedId <= 0) {
            setError("Enter a valid ID!");
            return;
        }

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await axios.get(`http://localhost:3000/api/get-key/${parsedId}`);
            setData(res.data.data);
        } catch (err) {
            setError(err.response ? err.response.data : "Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Get Information By ID</h2>
            <div style={styles.inputContainer}>
                <label htmlFor="id" style={styles.label}>Enter ID:</label>
                <input type="number" id="id" value={id} onChange={(e) => setId(e.target.value)} min="1" style={styles.input}/>
                <button
                    onClick={fetchDataById}
                    disabled={loading}  // Hanya loading yang mengontrol status tombol
                    style={{
                        ...styles.button,
                        backgroundColor: loading ? "#c0c0c0" : "#007bff",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Loading..." : "Fetch Data"}
                </button>
            </div>
            {error && (
                <div style={styles.error}>
                    <p>{error.message || error}</p>
                </div>
            )}
            {data && (
                <div style={styles.result}>
                    <h3 style={styles.resultTitle}>Data Retrieved Successfully</h3>
                    <p><strong>ID:</strong> {data.id}</p>
                    <p><strong>File Name:</strong> {data.fileName}</p>
                    <p><strong>Created At:</strong> {new Date(data.createdAt).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        // padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "500px",
        margin: "auto",
        textAlign: "center",
    },
    title: {
        fontSize: "2rem",
        fontWeight: "bold",
        marginTop: "10px",
        marginBottom: "20px",
    },
    inputContainer: {
        display: "flex",
        flexDirection: "row",
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
        width: "200px",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "10px 20px",
        fontSize: "1rem",
        color: "white",
        border: "none",
        borderRadius: "5px",
        transition: "background-color 0.3s ease",
    },
    error: {
        color: "red",
        marginTop: "20px",
    },
    resultTitle: {
        marginTop: "10px",
        textAlign: "center",
    },
    result: {
        textAlign: "left",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
    },
};

export default GetKeyById;