const mongoose = require("mongoose");

// One document per subscriber's active (or past) subscription.
// This is what replaces an Excel sheet — every renewal, cancellation,
// and delivery status lives here instead of a manually updated file.
const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    box: { type: mongoose.Schema.Types.ObjectId, ref: "Box", required: true },
    status: {
      type: String,
      enum: ["pending", "active", "paused", "cancelled"],
      default: "pending", // "pending" until payment/registration flow is wired up
    },
    startDate: { type: Date, default: Date.now },
    nextBillingDate: { type: Date },
    deliveryAddress: {
      street: String,
      city: String,
      county: String,
      notes: String, // e.g. gate code, landmark
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid", // real values populate once a payment provider is connected
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
