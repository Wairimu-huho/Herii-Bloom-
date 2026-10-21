const mongoose = require("mongoose");

const reviewProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  box: { type: mongoose.Schema.Types.ObjectId, ref: "Box", required: true },
  boxName: { type: String, required: true },
  reviewType: { type: String, enum: ["box", "products"], default: "box" },
  products: { type: [reviewProductSchema], default: [] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
  verifiedBuyer: { type: Boolean, default: false },
  flaggedByFilter: { type: Boolean, default: false },
  reports: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reason: String }],
  status: { type: String, enum: ["published", "hidden"], default: "published" },
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);