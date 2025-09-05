/**
 * Video Upload and Transcoding API
 * 
 * This module handles video uploading, metadata storage, transcoding, task tracking, 
 * and downloading. Implementation inspired by CAB432 course guidance and ChatGPT suggestions.
 */

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const db = require("../db");
const util = require("util"); 
const { spawn, exec } = require("child_process");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const execPromise = util.promisify(exec); // Promisify exec for async/await usage

let tasks = {}; // Store all transcoding tasks
let currentTasks = {}; // Store current tasks for tracking status

// =======================
// Multer Storage Configuration
// =======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Extract username from JWT token, default to 'guest'
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let username = "guest"; 
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        username = payload.username;
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }

    // Determine folder based on section
    const section = req.body.section || "default";
    const dir = path.join(__dirname, "../../videos/uploads", username, section);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Save file with timestamp prefix
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
let uploadMiddleware = upload.array("videos", 5); // Max 5 videos per upload

// =======================
// Upload Videos and Save Metadata to DB
// =======================
exports.uploadVideos = (req, res) => {
  uploadMiddleware(req, res, async function (err) {
    if (err) return res.status(500).json({ message: err.message });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });
    
    const username = req.user.username;
    const section = req.body.section || "default";
    const insertedFiles = [];

    try {
      for (const f of req.files) {
        const storedPath = path.join("videos", "uploads", username, section, f.filename); 
        // Insert metadata into database
        await db.execute(
          `INSERT INTO uploads (username, section_number, filename, mimetype, size, path) VALUES (?, ?, ?, ?, ?, ?)`,
          [username, section, f.originalname, f.mimetype, f.size, storedPath]
        );
        insertedFiles.push(f.filename);
      }

      res.json({
        message: "Uploaded successfully and metadata saved.",
        files: insertedFiles,
      });
    } catch (e) {
      console.error("DB insert error", e);
      res.status(500).json({ message: "DB error saving metadata." });
    }
  });
};

// =======================
// List Videos for a Section (from local folder)
// =======================
exports.listVideos = (req, res) => {
  const username = req.user.username;
  const section = req.query.section || "default";
  const dir = path.join(__dirname, "../../videos/uploads", username, section);
  console.log("The current directory:" + __dirname);
  if (!fs.existsSync(dir)) return res.json({ files: [] });
  const files = fs.readdirSync(dir);
  res.json({ files });
};

// =======================
// Get All Uploads (from DB)
// =======================
exports.getAllUploads = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query(`SELECT username, filename, upload_date FROM uploads`);
    conn.release();
    res.json(rows); 
  } catch (err) {
    console.error("Failed to fetch all uploads:", err);
    res.status(500).json({ error: "Failed to fetch uploads" });
  }
};

// =======================
// List All Videos (with optional section filter)
// =======================
exports.listAllVideos = async (req, res) => {
  try {
    const section = req.query.section;
    let query = "SELECT username, section_number, filename FROM uploads";
    const params = [];
    if (section) {
      query += " WHERE section_number = ?";
      params.push(section);
    }

    const conn = await pool.getConnection();
    const rows = await conn.query(query, params);
    conn.release();

    res.json({ files: rows.map(r => ({
      username: r.username,
      section: r.section_number,
      filename: r.filename
    })) });

  } catch (err) {
    console.error("Failed to fetch uploads:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// =======================
// Initialize Tasks from Disk (used when server restarts)
// =======================
function initTasksFromDisk(username) {
  const baseDir = path.join(__dirname, "../../videos/converted", username);
  if (!fs.existsSync(baseDir)) return {};

  const tasks = {};
  const sections = fs.readdirSync(baseDir, { withFileTypes: true })
                     .filter(dirent => dirent.isDirectory())
                     .map(dirent => dirent.name);

  sections.forEach(section => {
    const sectionDir = path.join(baseDir, section);
    const files = fs.readdirSync(sectionDir);
    files.forEach(file => {
      tasks[file] = { status: "completed", outputFile: file, section: section };
    });
  });

  return tasks;
}

// =======================
// Transcode Videos using FFmpeg
// =======================
exports.transcodeVideos = (req, res) => {
  const username = req.user.username;
  const section = req.body.section || "default";
  const files = req.body.files || [];
  if (files.length === 0)
    return res.status(400).json({ message: "Select Videos" });

  const inputDir = path.join(__dirname, "../../videos/uploads", username, section);
  const outputDir = path.join(__dirname, "../../videos/converted", username, section);

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Iterate through each video file and start transcoding
  files.forEach((file) => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file + ".mp4");

    // Initialize task status
    currentTasks[file] = { status: "processing", outputFile: file + ".mp4" };
    console.log("Running ffmpeg for:", currentTasks[file].outputFile);

    const ffmpegProcess = spawn(ffmpegPath, [
      "-i",
      inputPath,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "22",
      "-c:a",
      "aac",
      outputPath,
    ]);

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`Transcode Completed: ${outputPath}`);
        currentTasks[file].status = "completed";
      } else {
        console.error(`FFmpeg failed for ${file}, code ${code}`);
        currentTasks[file].status = "error";
      }
    });
  });

  res.json({
    message: "Transcode started, please wait.",
    files,
    tasks: currentTasks,
  });
};

// =======================
// Get Task Status
// =======================
exports.getTaskStatus = (req, res) => {
  const username = req.user.username;
  let tasks = currentTasks[username] || {};

  // Initialize from disk if memory is empty
  if (Object.keys(tasks).length === 0) {
    tasks = initTasksFromDisk(username);
    currentTasks[username] = tasks;
  }

  res.json({ tasks });
};

// =======================
// Download Transcoded Video
// =======================
exports.downloadVideo = (req, res) => {
  const username = req.user.username; 
  const { section, file } = req.params;

  const filePath = path.join(__dirname, "../../videos/converted", username, section, file);
  console.log("Download path:", filePath); 

  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");
  res.download(filePath);
};
