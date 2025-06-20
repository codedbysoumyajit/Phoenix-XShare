// controllers/fileController.js
import fs from "fs";
import path from "path";
import qrCode from "qrcode";
import { DateTime } from "luxon";
import log from "../utils/console.js";
import getDB from "../utils/mongodb.js";
import config from "../../config/config.js";
import {
  encryptFile,
  decryptFile,
  deleteFile,
  normalizeFileName,
  generateShortID,
} from "../utils/helpers.js";

// Define __dirname for static file serving and pathing
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename)); // Go up two directories to reach project root

/**
 * Renders the upload page.
 */
export const renderUploadPage = (req, res) => {
  res.render("upload");
};

/**
 * Handles the common logic for file uploads (both /upload and /webshare).
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {object} file - The file object from express-fileupload.
 */
async function handleFileUploadInternal(req, res, file) {
  try {
    const username = req.session.user;
    const db = await getDB();

    const fileExtension = path.extname(file.name);
    const normalizedName = normalizeFileName(file.name);
    const shortID = generateShortID();
    const fileName = `${normalizedName}-${shortID}${fileExtension}`;
    const filePath = path.join(__dirname, "uploads", fileName);

    const downloadLink = `${config.settings.domain}/download/${fileName}`;
    const qrdownloadLink = `${config.settings.domain}/cdn/${fileName}`; // Used for QR code
    const viewLink = `${config.settings.domain}/view/${fileName}`;
    const cdnLink = `${config.settings.domain}/cdn/${fileName}`; // Direct CDN link

    const localDateTime = DateTime.local();
    const formattedOutput = `Date: ${localDateTime.toLocaleString(
      DateTime.DATE_FULL,
    )} Time: ${localDateTime.toLocaleString(DateTime.TIME_24_SIMPLE)}`;

    const qrCodeImage = await qrCode.toDataURL(qrdownloadLink);

    if (config.settings.encryption) {
      await encryptFile(file.data, filePath);
    } else {
      fs.writeFileSync(filePath, file.data);
    }

    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

    const dataCollection = db.collection("file_uploadData");
    await dataCollection.insertOne({
      filename: fileName,
      uploadTime: formattedOutput,
      uploader: username,
      encryption: `${config.settings.encryption}`,
      fileSize: fileSizeInMegabytes.toFixed(fileSizeInMegabytes < 1 ? 2 : 0),
    });

    res.render("uploaded", {
      fileName,
      downloadLink,
      viewLink,
      cdnLink,
      qrCodeImage,
      uploader: username,
      uploadTime: formattedOutput,
    });
  } catch (err) {
    log(err.message, "error");
    return res
      .status(500)
      .render("error", { errorMessage: "File upload failed." });
  }
}

/**
 * Handles file upload from the main upload form.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const uploadFile = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res
      .status(400)
      .render("error", { errorMessage: "No file was uploaded." });
  }
  await handleFileUploadInternal(req, res, req.files.file);
};

/**
 * Handles file upload from web share.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const webshareUploadFile = async (req, res) => {
  if (!req.files || !req.files.mediaFiles) {
    return res
      .status(400)
      .render("error", { errorMessage: "No file was uploaded." });
  }
  if (Object.keys(req.files).length > 1) {
    return res.status(400).render("error", {
      errorMessage: "Only one file can be uploaded at a time.",
    });
  }
  await handleFileUploadInternal(req, res, req.files.mediaFiles);
};

/**
 * Handles file download page rendering.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const renderDownloadPage = async (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(__dirname, "uploads", fileName);
  const db = await getDB();

  if (!fs.existsSync(filePath)) {
    return res.status(404).render("error", { errorMessage: "File not found." });
  }

  const dataCollection = db.collection("file_uploadData");
  const fileData = await dataCollection.findOne({ filename: fileName });

  if (!fileData) {
    log(`File metadata not found for ${fileName} in DB.`, "warn");
    return res
      .status(404)
      .render("error", { errorMessage: "File not found or metadata missing." });
  }

  res.render("download", {
    fileName,
    uploadTime: fileData.uploadTime,
    uploader: fileData.uploader,
    fileSize: fileData.fileSize,
  });
};

/**
 * Handles direct file download/CDN access.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const cdnFile = async (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(__dirname, "uploads", fileName);
  const db = await getDB();

  if (!fs.existsSync(filePath)) {
    return res.status(404).render("error", { errorMessage: "File not found." });
  }

  const dataCollection = db.collection("file_uploadData");
  const fileData = await dataCollection.findOne({ filename: fileName });

  if (!fileData) {
    log(`File metadata not found for ${fileName} in DB.`, "warn");
    return res
      .status(404)
      .render("error", { errorMessage: "File not found or metadata missing." });
  }

  let downloadableFile;
  if (fileData.encryption === "true") {
    try {
      downloadableFile = await decryptFile(filePath);
    } catch (decryptErr) {
      log(`Decryption error for ${fileName}: ${decryptErr.message}`, "error");
      return res.status(500).render("error", {
        errorMessage: "Error decrypting file.",
      });
    }
  } else {
    downloadableFile = filePath;
  }

  res.download(downloadableFile, (err) => {
    if (err) {
      log(
        `Error sending file ${fileName} for download: ${err.message}`,
        "error",
      );
      if (!res.headersSent) {
        return res.status(500).render("error", {
          errorMessage: "Error occurred while downloading the file.",
        });
      }
    }
    if (fileData.encryption === "true" && downloadableFile) {
      deleteFile(downloadableFile);
    }
  });
};

/**
 * Handles file view page rendering.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const renderViewPage = async (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(__dirname, "uploads", fileName);
  const db = await getDB();

  if (!fs.existsSync(filePath)) {
    return res.status(404).render("error", { errorMessage: "File not found." });
  }

  const apiLink = `${config.settings.domain}/cdn/${fileName}`;
  const viewLink = `${config.settings.domain}/view/${fileName}`;

  const dataCollection = db.collection("file_uploadData");
  const fileData = await dataCollection.findOne({ filename: fileName });

  if (!fileData) {
    log(`File metadata not found for ${fileName} in DB.`, "warn");
    return res
      .status(404)
      .render("error", { errorMessage: "File not found or metadata missing." });
  }

  res.render("view", { fileName, apiLink, viewLink, fileData });
};
