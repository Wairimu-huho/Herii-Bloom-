const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["pads", "tampons", "chocolate", "tea", "candle", "addon"],
      required: true,
    },
    name: { type: String, required: true, trim: true }, // e.g. "Kortex", "Molped", "Hibiscus Tea"
    // Added on top of the box's base price if a subscriber picks this option.
    // 0 means it costs the same as any other choice in its category.
    priceModifier: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);