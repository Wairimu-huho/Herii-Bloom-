const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, trim: true }, // short teaser for the articles list page
    body: { type: String, required: true }, // full article content
    category: {
      type: String,
      enum: ["cycle education", "self care rituals", "product education", "wellness tips"],
      default: "wellness tips",
    },
    coverImage: { type: String }, // asset URL
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // admin who wrote it
    published: { type: Boolean, default: false }, // lets you draft before it goes live
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
