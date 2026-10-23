const mongoose = require("mongoose");

// Represents a box tier, e.g. "Premium Box" or "Basic Box"
const boxSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "Premium Box"
    tagline: { type: String, trim: true }, // "Complete care, more comfort."
    description: { type: String, trim: true, maxlength: 1200 }, // Detailed description shown consistently in the shop
    price: { type: Number, required: true }, // monthly price in KSh
    mostPopular: { type: Boolean, default: false },
    items: [{ type: String }], // ["Menstrual cup", "Organic pads (variety)", ...]
    // Legacy keys remain supported while categoryIds becomes the configurable source.
    categories: {
      type: [String],
      default: ["pads", "tampons", "chocolate", "tea", "candle", "addon"],
    },
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    image: { type: String }, // asset URL once uploaded
    photos: [{ url: { type: String, required: true, trim: true }, alt: { type: String, trim: true }, sortOrder: { type: Number, default: 0 }, active: { type: Boolean, default: true } }],
    active: { type: Boolean, default: true }, // lets you retire a tier without deleting history
  },
  { timestamps: true }
);

module.exports = mongoose.model("Box", boxSchema);
