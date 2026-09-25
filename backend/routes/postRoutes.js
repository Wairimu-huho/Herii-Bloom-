const express = require("express");
const router = express.Router();
const { getPosts, createPost, reportPost, getModerationQueue, moderatePost } = require("../controllers/postController");
const { getComments, createComment } = require("../controllers/commentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Posts
router.get("/", getPosts);
router.post("/", protect, createPost);
router.post("/:id/report", protect, reportPost);
router.get("/moderation", protect, adminOnly, getModerationQueue);
router.put("/:id/moderate", protect, adminOnly, moderatePost);

// Comments nested under a post
router.get("/:postId/comments", getComments);
router.post("/:postId/comments", protect, createComment);

module.exports = router;
