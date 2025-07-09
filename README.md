# Hybrid Cryptography File Sharing System

A Hybrid Cryptography File Sharing System is a secure solution designed for safe and efficient file sharing between two parties. It combines the strengths of AES (Advanced Encryption Standard) and RSA (Rivest-Shamir-Adleman) algorithms, leveraging the speed of symmetric encryption and the security of asymmetric encryption. This approach ensures both confidentiality and performance during file encryption and decryption.

# Features
## Hybrid Cryptography:
- **AES for encrypting files (efficient for large data).**
- **RSA for encrypting AES keys (ensures secure key exchange).**

## File Upload and Encryption:
- **Upload a file to encrypt it using AES.**
- **Encrypt the AES key using RSA.**

## File Decryption:
- **Decrypt the RSA-encrypted AES key using the private key.**
- **Decrypt the file using the decrypted AES key.**

## Send Information:
- **Store the encrypted AES key, file path, and IV (initialization vector) in the database.**

## Get Information:
- **Retrieve the encrypted AES key, file path, and IV (initialization vector) from the database using id.**

# Installation

## Prerequisites
- **Node.js installed on your system.**

## Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/repository-name.git
   cd repository-name
   ```

2. **Install library:**
   ```bash
   npm install express body-parser express-fileupload path fs
   ```

3. **Install sequelize:**
   ```bash
   npm install sequelize sequelize-cli pg pg-hstore
   ```

4. **Config database:**
   ```bash
   {
    "development": {
        "username": "your_username",
        "password": "your_password",
        "database": "your_database",
        "host": "127.0.0.1",
        "dialect": "postgres"
        }
   }
   ```

3. **Generate RSA Key Pair:** Run the following script to generate RSA key pairs (public.pem and private.pem):
   ```bash
   openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
   openssl rsa -pubout -in private.pem -out public.pem
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

# API Endpoints
  ## 1. Upload and Encrypt File

  - **API Endpoint:**
      - **Method:** POST
      - **URL:** /api/encrypt

  - **Description:** This API encrypts a file using AES encryption and securely encrypts the AES key with RSA. The encrypted file is saved to the server, and the encrypted AES key along with the IV (Initialization Vector) is returned to the client.

  - **Request Details:**
      - **Body**
          - **File (required):** The file to be uploaded and encrypted (as form-data).

  - **Response Details:**
      - **Success (201):** If the file is successfully encrypted, the server responds with the encrypted file path, the AES key (encrypted with RSA), and the IV.

          - **Response Example:**
              ```bash
              {
                "message": "File encrypted successfully",
                "encryptedFilePath": "/uploads/filename.enc",
                "encryptedAESKey": "Base64EncodedAESKey",
                "iv": "Base64EncodedIV"
              }
              ```
      
      - **Error Responses:**
          - **No File Uploaded (400):**
              ```bash
              {
                "status": "error",
                "message": "No file uploaded"
              }
              ```

          - **Failed to Save File (500):**
              ```bash
              {
                "status": "error",
                "message": "Failed to save file",
              }
              ```

          - **Failed to Encrypt File with AES (500):**
              ```bash
              {
                "status": "error",
                "message": "Failed to encrypt file",
              }
              ```

          - **Failed to Encrypt AES Key with RSA (500):**
              ```bash
              {
                "status": "error",
                "message": "Failed to encrypt AES key",
              }
              ```

  - **Encryption Process Summary:**
    - **1. File Upload:** The file is uploaded as part of the form-data request.
    - **2. Save File:** The file is saved to the server in a specific directory.
    - **3. AES Encryption:** The file is encrypted using AES with a randomly generated 256-bit key.
    - **4. Save Encrypted File:** The encrypted file is saved to the server with a .enc extension.
    - **5. RSA Encryption:** The AES key is encrypted using the RSA public key.
    - **6. Response:** The encrypted file path, RSA-encrypted AES key (Base64 encoded), and IV (Base64 encoded) are returned to the client.

  ## 2. Decrypt File

  - **API Endpoint:**
      - **Method:** POST
      - **URL:** /api/decrypt

  - **Description:** This API decrypts an encrypted file using the AES key (decrypted with RSA) and the initialization vector (IV). The decrypted file is saved to a server directory, and the file path is returned to the client.

  - **Request Details:**
      - **Body (JSON)**
          - **encryptedFilePath (required):** The path to the encrypted file (e.g., /encrypted/file.txt.enc).
          - **encryptedAESKey (required):** The AES key encrypted with RSA (Base64 format).
          - **iv (required):** The initialization vector used for AES decryption (Base64 format).

      - **Example Request Body:**    
          ```bash
          {
            "encryptedFilePath": "/encrypted/sample.txt.enc",
            "encryptedAESKey": "Base64EncodedAESKey",
            "iv": "Base64EncodedIV"
          }
          ```

  - **Response Details:**
      - **Success (200):** If the file is successfully decrypted, the server responds with the path to the decrypted file.

          - **Response Example:**
              ```bash
              {
                "message": "File decrypted successfully",
                "decryptedFilePath": "/decrypted/filename"
              }
              ```

      - **Error Responses:**
          - **Missing Required Parameters (400):**
              ```bash
              {
                "status": "error",
                "message": "Missing required parameters"
              }
              ```

          - **Encrypted File Not Found (404):**
              ```bash
              {
                "status": "error",
                "message": "Encrypted file not found"
              }
              ```

          - **Failed to Decrypt AES Key (500):**
              ```bash
              {
                "status": "error",
                "message": "Failed to decrypt AES key",
              }
              ```

          - **Failed to Decrypt File (500):**
              ```bash
              {
                "status": "error",
                "message": "Failed to decrypt file",
              }
              ```

          - **Failed to Save Decrypted File (500):**
              ```bash
              {
                "status": "error",
                "message": "Failed to save decrypted file",
              }
              ```

  - **Decryption Process Summary:**
    - **1. Retrieve Parameters::** Extract the encryptedFilePath, encryptedAESKey, and iv from request body.
    - **2. Decrypt AES Key:** The AES key (Base64) is decrypted using RSA private key.
    - **3. Validate Encrypted File:** Check if the encrypted file exists on the server.
    - **4. AES Decryption:** Use the decrypted AES key and IV (Base64 decoded) to decrypt file.
    - **5. Save Decrypted File:** The decrypted file is saved to a decrypted directory on the server.
    - **6. Response:** Return the path to the decrypted file to the client.


## 3. Send Information

  - **API Endpoint:**
      - **Method:** POST
      - **URL:** /api/send-key

  - **Description:** This API saves an encrypted file path, an encrypted AES key, and an initialization vector (IV) to the database. The AES key is further encrypted using AES-256-CBC with a SECRET_KEY and IV.

  - **Request Details:**
      - **Body (JSON)**
          - **encryptedFilePath (required):** The file path of the encrypted file (e.g., /encrypted/file.txt.enc).
          - **encryptedAESKey (required):** The AES key in plaintext format to be encrypted.
          - **iv (required):** The initialization vector in Base64 format.
      
      - **Example Request Body:**    
          ```bash
          {
            "encryptedFilePath": "/encrypted/sample.txt.enc",
            "encryptedAESKey": "Base64EncodedAESKey",
            "iv": "Base64EncodedIV"
          }
          ```

  - **Response Details:**
      - **Success (201):** If the data is successfully saved to the database, the server responds with a success message.

          - **Response Example:**
              ```bash
              {
                "status": "success",
                "message": "Data saved successfully."
              }
              ```
      
      - **Error Responses:**
          - **Missing Required Fields (400):**
              ```bash
              {
                "status": "error",
                "message": "Field is empty. All fields are required."
              }
              ```

          - **Invalid IV (400):**
              ```bash
              {
                "status": "error",
                "message": "IV invalid. Must be 16 bytes when decoded."
              }
              ```

          - **Server Misconfiguration (500):**
              ```bash
              {
                "status": "error",
                "message": "Server misconfiguration."
              }
              ```

          - **Failed to Save Data (500):**
              ```bash
              {
                "status": "error",
                "message": "Failed to save data."
              }
              ```

  - **Send Information Summary:**
    - **1. Input Validation:** Validate that encryptedFilePath, encryptedAESKey, and iv are provided in the request body.
    - **2. Convert IV:** Decode the IV from Base64 and validate its length (must be 16 bytes).
    - **3. Use SECRET_KEY:** Retrieve the SECRET_KEY from the environment or use a fallback key (for development).
    - **4. Encrypt AES Key:** Encrypt the provided AES key using AES-256-CBC with the SECRET_KEY and IV.
    - **5. Save to Database:** Save the encryptedFilePath, encryptedAESKey, and iv in the database.
    - **6. Response:** Return a success message upon successful storage.

## 4. Receive Information

  - **API Endpoint:**
      - **Method:** POST
      - **URL:** /api/get-key/:id

  - **Description:** This API retrieves an encrypted AES key and file path from the database using the provided ID. It decrypts the AES key using AES-256-CBC with the SECRET_KEY and IV and returns the decrypted AES key along with the file path.

  - **Request Details:**
      - **Path Parameter**
          - **id (required):** The unique ID of the data to retrieve.
      
      - **Example Request (URL):**    
          ```bash
          GET /api/get-key/1
          ```

  - **Response Details:**
      - **Success (201):** If the data is successfully retrieved and decrypted, the server responds with the decrypted AES key and associated file path.

          - **Response Example:**
              ```bash
              {
                "status": "success",
                "message": "Data saved successfully."
                "data": {
                    "encryptedFilePath": "/encrypted/sample.txt.enc",
                    "decryptedAESKey": "myAESKey123",
                    "iv": "e8gOPo9jqybCqaoq7YNGQ=="
                }
              }
              ```
      
      - **Error Responses:**
          - **Data Not Found (404):**
              ```bash
              {
                "status": "error",
                "message": "Data not found"
              }
              ```

          - **Invalid Data for Decryption (400):**
              ```bash
              {
                "status": "error",
                "message": "Data invalid for decryption"
              }
              ```

          - **Server Misconfiguration (500):**
              ```bash
              {
                "status": "error",
                "message": "Server misconfiguration."
              }
              ```

  - **Receive Information Summary:**
    - **1. Fetch Data by id:** Retrieve the encryptedFilePath, encryptedKey, and iv from the database using the provided id.
    - **2. Validate SECRET_KEY:** Retrieve the SECRET_KEY from the environment or use a fallback for development, and validate that it is 32 bytes in length.
    - **3. Convert IV:** Convert the IV from Base64 to Buffer.
    - **4. Decrypt AES Key:** Use AES-256-CBC to decrypt the encrypted AES key using the SECRET_KEY and IV.
    - **5. Response:** Return the decrypted AES key, file path, and IV to the client.

# How It Works

1. **Upload File:**
- The file is uploaded and encrypted using AES.
- An AES key is generated and encrypted using RSA.

2. **Encryption:**
- AES-encrypted file is saved as filename.enc.
- AES key is encrypted using RSA and stored as a Base64 string.

3. **Decryption:**
- The AES key is decrypted using the private RSA key.
- The file is decrypted using the decrypted AES key and the provided IV.

4. **Send Information:**
- The AES key is encrypted using AES-256-CBC with a SECRET_KEY and the provided IV.
- The encrypted AES key, file path, and IV (in Base64 format) are stored in the database.

5. **Receive Information:**
- The encrypted AES key, file path, and IV are retrieved from the database using the provided id.
- The AES key is decrypted using AES-256-CBC with the SECRET_KEY and IV, and the decrypted data is returned to the client.

# Contributors

- **Moammar Saddam - Backend Development**
- **Putri Cellyenda - Frontend Development**
- **Aira Putri Deninta - Documentation**