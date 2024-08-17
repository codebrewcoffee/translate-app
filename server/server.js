const express = require("express");
const { Translate } = require("@google-cloud/translate").v2;
const cors = require("cors");
const http = require("http");
const path = require("path"); // Add this line
require("dotenv").config();

const app = express();

// Middleware to handle larger request bodies
app.use(express.json({ limit: "10mb" })); // Adjust as needed
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with the correct URL for your frontend
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

const translate = new Translate({
  key: process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY,
});

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

const server = http.createServer(
  {
    maxHeadersCount: 2000, // Default is usually 1000; increase this if needed
    maxHeaderSize: 8192, // This sets the maximum size of the headers in bytes (default is 8192 bytes or 8 KB)
  },
  app
);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
