// /routes/videos.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Video = require("../models/Video");

// Configuración de multer para guardar los videos en /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST - Subir video
router.post("/", upload.single("video"), async (req, res) => {
  try {
    const video = new Video({
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
    });

    await video.save();
    res.status(200).json({ message: "Video guardado", url: video.url });
  } catch (error) {
    console.error("Error al subir video:", error);
    res.status(500).json({ message: "Error interno" });
  }
});

// GET - Listar todos los videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener videos" });
  }
});

module.exports = router;
