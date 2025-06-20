// utils/helpers.js
import crypto from "crypto";
import fs from "fs";
import path from "path";
import getDB from "./mongodb.js";
import log from "./console.js"; // Import your logger

// Define __dirname for temporary decrypted file pathing
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // Go up two directories to reach project root

/**
 * Generates a random hexadecimal string for session secret.
 * @returns {Promise<string>} A promise that resolves with the random secret.
 */
export function generateRandomSecret() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString("hex"));
      }
    });
  });
}

/**
 * Encrypts file data and stores encryption metadata in the database.
 * @param {Buffer} fileData - The unencrypted file data.
 * @param {string} filePath - The path where the encrypted file will be saved.
 * @returns {Promise<string>} A promise that resolves with the path to the encrypted file.
 */
export async function encryptFile(fileData, filePath) {
  const key = crypto.randomBytes(32); // Generate a random 32-byte key
  const iv = crypto.randomBytes(16); // Generate a random 16-byte IV

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encryptedData = Buffer.concat([
    cipher.update(fileData),
    cipher.final(),
  ]);

  fs.writeFileSync(filePath, encryptedData);

  const db = await getDB();
  const dataCollection = db.collection("encryption_Data");

  await dataCollection.insertOne({
    filePath: filePath,
    key: key.toString("hex"),
    iv: iv.toString("hex"),
  });

  return filePath;
}

/**
 * Decrypts a file using metadata from the database.
 * @param {string} filePath - The path to the encrypted file.
 * @returns {Promise<string>} A promise that resolves with the path to the decrypted file.
 */
export async function decryptFile(filePath) {
  const encryptedData = fs.readFileSync(filePath);

  const db = await getDB();
  const dataCollection = db.collection("encryption_Data");

  const fileData = await dataCollection.findOne({ filePath: filePath });

  if (!fileData || !fileData.key || !fileData.iv) {
    throw new Error("Key or IV not found in database for decryption.");
  }

  const key = Buffer.from(fileData.key, "hex");
  const iv = Buffer.from(fileData.iv, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decryptedData = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  // Create a temporary path for the decrypted file
  const decryptedFilePath = path.join(
    __dirname,
    "temp_decrypted",
    path.basename(filePath),
  );
  // Ensure the temp_decrypted directory exists
  if (!fs.existsSync(path.dirname(decryptedFilePath))) {
    fs.mkdirSync(path.dirname(decryptedFilePath), { recursive: true });
  }

  fs.writeFileSync(decryptedFilePath, decryptedData);

  return decryptedFilePath;
}

/**
 * Deletes a file from the filesystem.
 * @param {string} filePath - The path of the file to delete.
 */
export function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      log(`Error deleting file: ${filePath}, Error: ${err.message}`, "error");
    } else {
      log(`File deleted successfully: ${filePath}`, "info");
    }
  });
}

/**
 * Normalizes a filename by removing spaces.
 * @param {string} filename - The original filename.
 * @returns {string} The normalized filename.
 */
export function normalizeFileName(filename) {
  const fileN = filename.split(".")[0];
  return fileN.includes(" ") ? fileN.replace(/ /g, "") : fileN;
}

/**
 * Generates a short random ID.
 * @returns {string} A random alphanumeric string.
 */
export function generateShortID() {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(
    { length: crypto.randomInt(5, 11) },
    () => characters[crypto.randomInt(characters.length)],
  ).join("");
}
