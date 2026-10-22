const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const { getBoxes, getAllBoxes, createBox, updateBox, uploadBoxPhoto, deleteBox } = require("../controllers/boxController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const uploadDirectory = path.join(__dirname, "../uploads/boxes");
fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `box-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});

router.get("/", getBoxes);
router.get("/admin", protect, adminOnly, getAllBoxes);
router.post("/", protect, adminOnly, createBox);
router.put("/:id", protect, adminOnly, updateBox);
router.post("/:id/photos", protect, adminOnly, upload.single("photo"), uploadBoxPhoto);
router.delete("/:id", protect, adminOnly, deleteBox);

module.exports = router;