const Post = require("../models/Post");
const { checkContent, REPORT_THRESHOLD } = require("../utils/moderation");

// @route GET /api/posts  (public — visible posts only)
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "visible" })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/posts  (any logged-in user)
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { flaggedByFilter } = checkContent(`${title} ${content}`);

    const post = await Post.create({
      user: req.user._id,
      title,
      content,
      flaggedByFilter,
      // caught by the filter -> starts hidden for admin review instead of blocking outright
      status: flaggedByFilter ? "hidden" : "visible",
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/posts/:id/report  (any logged-in user)
const reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.reportedBy.includes(req.user._id)) {
      return res.status(400).json({ message: "You've already reported this post" });
    }

    post.reportedBy.push(req.user._id);
    post.reportCount += 1;

    if (post.reportCount >= REPORT_THRESHOLD) {
      post.status = "hidden";
    }

    await post.save();
    res.json({ message: "Post reported", reportCount: post.reportCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/posts/moderation  (admin only — the review queue)
const getModerationQueue = async (req, res) => {
  try {
    const posts = await Post.find({ status: { $in: ["hidden"] } })
      .populate("user", "name email")
      .sort({ reportCount: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/posts/:id/moderate  (admin only — approve or remove)
const moderatePost = async (req, res) => {
  try {
    const { action } = req.body; // "restore" or "remove"
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.status = action === "restore" ? "visible" : "removed";
    if (action === "restore") {
      post.reportCount = 0;
      post.reportedBy = [];
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPosts, createPost, reportPost, getModerationQueue, moderatePost };
