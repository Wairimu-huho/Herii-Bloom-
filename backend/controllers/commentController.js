const Comment = require("../models/Comment");
const { checkContent, REPORT_THRESHOLD } = require("../utils/moderation");

// @route GET /api/posts/:postId/comments  (public — visible comments on a post)
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, status: "visible" })
      .populate("user", "name")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/posts/:postId/comments  (any logged-in user)
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { flaggedByFilter } = checkContent(content);

    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user._id,
      content,
      flaggedByFilter,
      status: flaggedByFilter ? "hidden" : "visible",
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArticleComments = async (req, res) => {
  try {
    const Article = require("../models/Article");
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: "Article not found" });
    const comments = await Comment.find({ article: article._id, status: "visible" }).populate("user", "name").sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createArticleComment = async (req, res) => {
  try {
    const Article = require("../models/Article");
    const article = await Article.findOne({ slug: req.params.slug, published: true });
    if (!article) return res.status(404).json({ message: "Article not found" });
    const content = String(req.body.content || "").trim();
    if (!content) return res.status(400).json({ message: "Comment cannot be empty" });
    if (content.length > 1000) return res.status(400).json({ message: "Comment must be 1000 characters or fewer" });
    const { flaggedByFilter } = checkContent(content);
    const comment = await Comment.create({ article: article._id, user: req.user._id, content, flaggedByFilter, status: flaggedByFilter ? "hidden" : "visible" });
    await comment.populate("user", "name");
    res.status(201).json({ comment, flagged: flaggedByFilter });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @route POST /api/comments/:id/report  (any logged-in user)
const reportComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.reportedBy.includes(req.user._id)) {
      return res.status(400).json({ message: "You've already reported this comment" });
    }

    comment.reportedBy.push(req.user._id);
    comment.reportCount += 1;

    if (comment.reportCount >= REPORT_THRESHOLD) {
      comment.status = "hidden";
    }

    await comment.save();
    res.json({ message: "Comment reported", reportCount: comment.reportCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/comments/moderation  (admin only)
const getCommentModerationQueue = async (req, res) => {
  try {
    const comments = await Comment.find({ status: "hidden" })
      .populate("user", "name email")
      .populate("post", "title")
      .populate("article", "title slug")
      .sort({ reportCount: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/comments/:id/moderate  (admin only)
const moderateComment = async (req, res) => {
  try {
    const { action } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.status = action === "restore" ? "visible" : "removed";
    if (action === "restore") {
      comment.reportCount = 0;
      comment.reportedBy = [];
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getComments,
  getArticleComments,
  createArticleComment,
  createComment,
  reportComment,
  getCommentModerationQueue,
  moderateComment,
};
