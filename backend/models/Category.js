const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    minSelections: { type: Number, default: 0, min: 0 },
    maxSelections: { type: Number, default: 1, min: 0 },
    allowRepeat: { type: Boolean, default: false },
    optionalExtra: { type: Boolean, default: false },
    atLeastOneGroup: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
