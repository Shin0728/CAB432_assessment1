/**
 * Video Routes for Task Manager App
 * 
 * Connects the videoController logic to REST API endpoints.
 * Each endpoint uses Express Router and is protected by JWT authentication.
 * Implementation inspired by CAB432 course guidance.
 */

const express = require("express");
const router = express.Router();
const auth = require("../auth");
const videoController = require("../controllers/videoController");

// =======================
// Upload Videos (supports multiple files)
// Endpoint: POST /upload
// Protected: Requires valid JWT token
// =======================
router.post("/upload", auth.authenticateToken, videoController.uploadVideos);

// =======================
// List Uploaded Videos for a User and Section
// Endpoint: GET /list
// Protected: Requires valid JWT token
// Returns list of files from user's upload folder
// =======================
router.get("/list", auth.authenticateToken, videoController.listVideos);

// =======================
// List All Uploads (Admin Only)
// Endpoint: GET /allUploads
// Protected: Requires valid JWT token
// Returns all uploaded files and metadata from the database
// =======================
router.get('/allUploads', auth.authenticateToken, videoController.getAllUploads);

// =======================
// Transcode Selected Videos
// Endpoint: POST /transcode
// Protected: Requires valid JWT token
// Starts transcoding process for selected videos
// =======================
router.post("/transcode", auth.authenticateToken, videoController.transcodeVideos);

// =======================
// Check Status of Transcoding Tasks
// Endpoint: GET /status
// Protected: Requires valid JWT token
// Returns current status of all transcoding tasks for the user
// =======================
router.get("/status", auth.authenticateToken, videoController.getTaskStatus);

// =======================
// Download Transcoded Video
// Endpoint: GET /download/:section/:file
// Protected: Requires valid JWT token
// Allows user to download a completed transcoded video
// =======================
router.get("/download/:section/:file", auth.authenticateToken, videoController.downloadVideo);

// Export router to be used in main Express app
module.exports = router;
