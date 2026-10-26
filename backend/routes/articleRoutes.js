const express = require("express");
const router = express.Router();
const {
  getArticles,
  getAllArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/admin", protect, adminOnly, getAllArticles);
router.get("/", getArticles);
router.get("/:slug", getArticleBySlug);
router.post("/", protect, adminOnly, createArticle);
router.put("/:id", protect, adminOnly, updateArticle);
router.delete("/:id", protect, adminOnly, deleteArticle);

module.exports = router;
