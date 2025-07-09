import React, { useEffect, useState } from "react";
import axios from "axios";

const GetAllKeys = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/get-key");
                setData(res.data.data); // Extract data from response
            } catch (err) {
                setError(err.response ? err.response.data : "Server error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>All Encrypted File Information</h2>
            {loading && <p style={styles.loading}>Loading data...</p>}
            {error && (
                <div style={styles.error}>
                    <h3>Error</h3>
                    <p>{error.message || error}</p>
                </div>
            )}
            {!loading && !error && (
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>ID</th>
                                <th style={styles.tableHeader}>File Name</th>
                                <th style={styles.tableHeader}>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item.id} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                                    <td style={styles.tableCell}>{item.id}</td>
                                    <td style={styles.tableCell}>{item.fileName}</td>
                                    <td style={styles.tableCell}>{new Date(item.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        fontFamily: "'Arial', sans-serif",
        maxWidth: "750px",
        margin: "auto",
        textAlign: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: "2rem",
        fontWeight: "bold",
        marginTop: "-10px",
        marginBottom: "20px",
        color: "#333",
    },
    loading: {
        fontSize: "1.2rem",
        color: "#555",
    },
    error: {
        color: "red",
        marginTop: "20px",
        fontSize: "1.2rem",
    },
    tableWrapper: {
        overflowX: "auto",
        borderRadius: "10px",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "10px",
        backgroundColor: "#fff",
    },
    tableHeader: {
        backgroundColor: "#007BFF",
        color: "white",
        padding: "15px",
        fontSize: "1.2rem",
        textAlign: "center",
    },
    tableRowEven: {
        backgroundColor: "#f2f2f2",
    },
    tableRowOdd: {
        backgroundColor: "#fff",
    },
    tableCell: {
        padding: "12px",
        fontSize: "1rem",
        textAlign: "center",
        borderBottom: "1px solid #ddd",
    },
};

export default GetAllKeys;