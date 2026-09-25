const express = require("express");
const router = express.Router();
const {
  reportComment,
  getCommentModerationQueue,
  moderateComment,
} = require("../controllers/commentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/:id/report", protect, reportComment);
router.get("/moderation", protect, adminOnly, getCommentModerationQueue);
router.put("/:id/moderate", protect, adminOnly, moderateComment);

module.exports = router;
