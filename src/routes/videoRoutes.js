// Now that we have a model and controller, we need to connect 
// these to the interface of the Task Manager app. Our UI is going
//  to be a REST HTTP API, therefore, we need to tell the Express 
// app what are our endpoints/routes (i.e., HTTP URLs) for reaching
// the controllers.

const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");

// 上傳影片（支援多檔）
router.post("/upload", videoController.uploadVideos);

// 顯示已上傳影片清單
router.get("/list", videoController.listVideos);

// 選擇影片進行轉檔
router.post("/transcode", videoController.transcodeVideos);

module.exports = router;
