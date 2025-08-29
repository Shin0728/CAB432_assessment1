// implements the logic around the model. Notice that this 
// controller handles the incoming request (req) and outgoing 
// response (res), and has no direct interaction with the database
// -- the data model does that.
 

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const db = require('../db');
const util = require('util');  //new
const { exec } = require("child_process");

const execPromise = util.promisify(exec);  //new


// 設定上傳目錄與檔名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const section = req.body.section || "default";
    const dir = path.join(__dirname, "../../videos/uploads", section);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

let uploadMiddleware = upload.array("videos", 5); // 最多同時上傳10個影片

// =======================
// 上傳影片 + 寫入 DB metadata
// =======================

exports.uploadVideos = (req, res) => {
  uploadMiddleware(req, res, async function (err) {
    if (err) return res.status(500).json({ message: err.message });
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });

    const section = req.body.section || "default";
    const insertedFiles = [];

    try {
      for (const f of req.files) {
        const storedPath = path.join('videos', 'uploads', section, f.filename); // 儲存在 DB 的相對路徑
        // 將 metadata 寫進 DB
        await db.execute(
          `INSERT INTO uploads (section_number, filename, mimetype, size, path) VALUES (?, ?, ?, ?, ?)`,
          [section, f.originalname, f.mimetype, f.size, storedPath]
        );
        insertedFiles.push(f.filename);
      }

      res.json({ message: "Uploaded successfully and metadata saved.", files: insertedFiles });
    } catch (e) {
      console.error('DB insert error', e);
      res.status(500).json({ message: 'DB error saving metadata.' });
    }
  });
};


// =======================
// 列出某個 section 的影片 (從 DB)
exports.listVideos = (req, res) => {
  const section = req.query.section || "default";
  const dir = path.join(__dirname, "../../videos/uploads", section);
  console.log("The current directory:"+__dirname);
  if (!fs.existsSync(dir)) return res.json({ files: [] });
  const files = fs.readdirSync(dir);
  res.json({ files });
};


exports.transcodeVideos = (req, res) => {
  const section = req.body.section || "default";
  const files = req.body.files || [];
  if (files.length === 0) return res.status(400).json({ message: "Select Videos" });

  const inputDir = path.join(__dirname, "../../videos/uploads", section);
  const outputDir = path.join(__dirname, "../../videos/converted", section);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 遍歷要轉檔的影片
  files.forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file + ".mp4");

    const command = `"${ffmpegPath}" -i "${inputPath}" -c:v libx264 -preset veryslow -crf 22 -c:a aac "${outputPath}"`;
    console.log("Running:", command);

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("FFmpeg error:", err);
        return;
      }
      console.log(`Transcode Completed! Please check the coverted folder: ${outputPath}`);
      res.json({ message: "Transcode Completed!", files });
    });
  });

  res.json({ message: "Transcode started，Please check the coverted folder", files });
};

// 選擇影片進行轉檔 (示範，實際要用 ffmpeg)
// exports.transcodeVideos = (req, res) => {
//   const section = req.body.section || "default";
//   const files = req.body.files || [];
//   if (files.length === 0) return res.status(400).json({ message: "請選擇影片" });

//   console.log(`開始轉檔影片: ${files.join(", ")}`);
//   // 這裡可以加入 ffmpeg 轉檔邏輯
//   setTimeout(() => {
//     res.json({ message: "轉檔完成", files });
//   }, 3000); // 模擬 CPU-intensive process
// };
