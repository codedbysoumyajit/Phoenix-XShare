// index.js
import express from "express";
import fileUpload from "express-fileupload";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import log from "./utils/console.js";
import config from "../config/config.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import { generateRandomSecret } from "./utils/helpers.js";

const app = express();
const server = createServer(app);

// --- Configuration and Global Middleware ---
app.set("view engine", "ejs");
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

// Define __dirname for static file serving and pathing
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'views' directory
app.use(express.static(path.join(__dirname, "views")));
app.set("views", path.join(__dirname, "views"));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload()); // Make sure this middleware comes before routes that handle file uploads
app.use(cors());

// Session setup
const memoryStore = new session.MemoryStore();
// Generate secret once when the application starts
const SESSION_SECRET = await generateRandomSecret(); // Await top-level for module

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: config.settings.mongoURI,
      dbName: "phoenix-xshare",
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 days in seconds
      crypto: {
        secret: SESSION_SECRET, // use a strong, random string here
        algorithm: "aes-256-gcm", // optional, default
        hashing: "sha512",        // optional, default
        encodeAs: "hex",          // optional, default
      },
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
      secure: false, // Set to true in production with HTTPS
    },
  })
);

// --- Route Mounting ---
app.use("/", authRoutes); // Login related routes
app.use("/", fileRoutes); // File upload/download related routes

// --- Error Handlers ---
// 404 handler
app.use((req, res, next) => {
  res.status(404).render("error", { errorMessage: "Page not found." });
});

// --- Server Start ---
server.listen(config.settings.port, () => {
  log(`Phoenix XShare is running on port ${config.settings.port}`, "info");
});