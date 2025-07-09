import React, { useState } from "react";
import FileEncryptor from "./fileEncryptor";
import FileDecryptor from "./fileDecryptor";
import Information from "./information";
import BruteForceSimulator from "./bruteforce";
import "./App.css";

const App = () => {
  const [showEncryption, setShowEncryption] = useState(false);
  const [showDecryption, setShowDecryption] = useState(false);
  const [showInformation, setShowInformation] = useState(false);
  const [showBruteForce, setShowBruteForce] = useState(false);

  const toggleEncryption = () => {
    setShowEncryption(!showEncryption);
    setShowDecryption(false);
    setShowInformation(false);
    setShowBruteForce(false);
  };

  const toggleDecryption = () => {
    setShowDecryption(!showDecryption);
    setShowEncryption(false);
    setShowInformation(false);
    setShowBruteForce(false);
  };

  const toggleInformation = () => {
    setShowInformation(!showInformation);
    setShowEncryption(false);
    setShowDecryption(false);
    setShowBruteForce(false);
  };

  const toggleBruteForce = () => {
    setShowBruteForce(!showBruteForce);
    setShowEncryption(false);
    setShowDecryption(false);
    setShowInformation(false);
  };

  return (
    <div className="page">
      <h1>Welcome to Hybrid Cryptography File Sharing System</h1>
      <p>This system combine encryption and decryption using AES and RSA algorithms.</p>
      <p>Choose an action to get started.</p>

      <div className="buttonContainer">
        <button className="button" onClick={toggleEncryption}>
          {showEncryption ? "Hide Encryption" : "Encryption"}
        </button>
        <button className="button" onClick={toggleDecryption}>
          {showDecryption ? "Hide Decryption" : "Decryption"}
        </button>
        <button className="button" onClick={toggleInformation}>
          {showInformation ? "Hide Information" : "Information"}
        </button>
        <button className="button" onClick={toggleBruteForce}>
          {showBruteForce ? "Hide Brute Force" : "Brute Force"}
        </button>
      </div>

      {showEncryption && (
        <div className="formContainer">
          <FileEncryptor />
        </div>
      )}

      {showDecryption && (
        <div className="formContainer">
          <FileDecryptor />
        </div>
      )}

      {showInformation && (
        <div className="formContainer">
          <Information />
        </div>
      )}

      {showBruteForce && (
        <div className="formContainer">
          <BruteForceSimulator />
        </div>
      )}
    </div>
  );
};

export default App;