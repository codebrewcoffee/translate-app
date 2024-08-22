const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") }); // Ensure this is at the top of your file

const express = require("express");
const { Translate } = require("@google-cloud/translate").v2;
const cors = require("cors");
const http = require("http");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://codebrewcoffee.github.io",
];

// Middleware to handle larger request bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware to filter out WebSocket upgrade requests
app.use((req, res, next) => {
  if (
    req.headers.upgrade &&
    req.headers.upgrade.toLowerCase() === "websocket"
  ) {
    res.status(400).send("WebSockets are not supported on this server");
  } else {
    next();
  }
});

// Log request headers
app.use((req, res, next) => {
  console.log("Request Headers:", req.headers);
  next();
});

// Verify that the API key is loaded correctly
console.log(
  "Google Cloud API Key:",
  process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY
);

// Initialize Google Cloud Translate API
const translate = new Translate({
  key: process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY,
});

// Translation endpoint
app.post("/translate", async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).send("Missing required fields: text and targetLang");
  }

  try {
    const [translation] = await translate.translate(text, targetLang);
    res.json({ translatedText: translation });
  } catch (error) {
    console.error("Error during translation request:", error);
    res.status(500).send("Translation failed");
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "..", "client", "build")));

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

// Create and start HTTP server
const server = http.createServer(
  {
    maxHeadersCount: 2000,
    maxHeaderSize: 8192,
  },
  app
);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
