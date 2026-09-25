const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    status: { type: String, enum: ["visible", "hidden", "removed"], default: "visible" },
    reportCount: { type: Number, default: 0 },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    flaggedByFilter: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
