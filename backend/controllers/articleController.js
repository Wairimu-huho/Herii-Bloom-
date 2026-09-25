const Article = require("../models/Article");

// @route GET /api/articles  (public — only published ones)
const getArticles = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { published: true };
    if (category) filter.category = category;

    const articles = await Article.find(filter).sort({ publishedAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/articles/:slug  (public — single article by slug)
const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, published: true });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/articles  (admin only)
const createArticle = async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      author: req.user._id,
      publishedAt: req.body.published ? new Date() : undefined,
    };
    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/articles/:id  (admin only)
const updateArticle = async (req, res) => {
  try {
    const updates = { ...req.body };
    // set publishedAt the moment it flips from draft to published
    if (updates.published) {
      const existing = await Article.findById(req.params.id);
      if (existing && !existing.published) updates.publishedAt = new Date();
    }
    const article = await Article.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/articles/:id  (admin only)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };
