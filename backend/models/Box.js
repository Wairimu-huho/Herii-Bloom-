const mongoose = require("mongoose");

// Represents a box tier, e.g. "Premium Box" or "Basic Box"
const boxSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "Premium Box"
    tagline: { type: String, trim: true }, // "Complete care, more comfort."
    price: { type: Number, required: true }, // monthly price in KSh
    mostPopular: { type: Boolean, default: false },
    items: [{ type: String }], // ["Menstrual cup", "Organic pads (variety)", ...]
    image: { type: String }, // asset URL once uploaded
    active: { type: Boolean, default: true }, // lets you retire a tier without deleting history
  },
  { timestamps: true }
);

module.exports = mongoose.model("Box", boxSchema);
