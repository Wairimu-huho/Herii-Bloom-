const mongoose = require("mongoose");

const selectionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    unitPriceModifier: { type: Number, default: 0 },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ["scheduled", "shipped", "delivered", "cancelled"], default: "scheduled" },
    selections: { type: [selectionSchema], default: [] },
    boxPrice: { type: Number, required: true },
    productsTotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    box: { type: mongoose.Schema.Types.ObjectId, ref: "Box", required: true },
    boxName: { type: String, required: true },
    boxPrice: { type: Number, required: true },
    purchaseType: { type: String, enum: ["one_time", "three_month"], default: "one_time" },
    selections: { type: [selectionSchema], default: [] },
    productsTotal: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      county: String,
      deliveryNotes: String,
    },
    phone: { type: String, required: true },
    gift: {
      isGift: { type: Boolean, default: false },
      recipientName: String,
      recipientPhone: String,
    },
    cardMessage: { type: String, maxlength: 240, trim: true },
    cancellationAccepted: { type: Boolean, required: true },
    cancellationPolicyVersion: { type: String, default: "2026-10-20" },
    deliveries: { type: [deliverySchema], default: [] },
    status: { type: String, enum: ["pending", "active", "cancelled", "completed"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed", "partially_refunded"], default: "unpaid" },
    cancelledAt: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
