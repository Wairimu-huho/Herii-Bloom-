const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    name: { type: String, required: true, trim: true }, // e.g. "Kortex", "Molped", "Hibiscus Tea"
    hasOptions: { type: Boolean, default: true },
    // Added on top of the box's base price if a subscriber picks this option.
    // 0 means it costs the same as any other choice in its category.
    priceModifier: { type: Number, default: 0 },
    standalonePrice: { type: Number, min: 0, default: null },
    active: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    inventory: { type: Number, min: 0, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);