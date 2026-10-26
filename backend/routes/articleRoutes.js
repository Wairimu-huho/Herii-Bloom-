const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const {
  getArticles,
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadArticleCover,
} = require("../controllers/articleController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const uploadDirectory = path.join(__dirname, "../uploads/articles");
fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => callback(null, `article-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) });

router.get("/admin", protect, adminOnly, getAllArticles);
router.get("/", getArticles);
router.get("/:slug", getArticleBySlug);
router.post("/", protect, adminOnly, createArticle);
router.put("/:id", protect, adminOnly, updateArticle);
router.post("/:id/cover", protect, adminOnly, upload.single("cover"), uploadArticleCover);
router.delete("/:id", protect, adminOnly, deleteArticle);

module.exports = router;
