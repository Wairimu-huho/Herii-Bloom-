const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    // "visible" by default so the community feels alive immediately.
    // "hidden" once auto-flagged by reports, "removed" once an admin confirms it should stay down.
    status: { type: String, enum: ["visible", "hidden", "removed"], default: "visible" },
    reportCount: { type: Number, default: 0 },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // prevents the same user reporting twice
    flaggedByFilter: { type: Boolean, default: false }, // true if the profanity filter caught something on submission
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
