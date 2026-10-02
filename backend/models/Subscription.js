const mongoose = require("mongoose");

// One document per subscriber's active (or past) subscription.
// This is what replaces an Excel sheet — every renewal, cancellation,
// and delivery status lives here instead of a manually updated file.
const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    box: { type: mongoose.Schema.Types.ObjectId, ref: "Box", required: true },
    // A subscriber's actual product picks, e.g. one pads brand, one tampon brand,
    // one chocolate, five tea entries (repeats allowed), one candle scent.
    selections: [
      {
        category: {
          type: String,
          enum: ["pads", "tampons", "chocolate", "tea", "candle", "addon"],
          required: true,
        },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    // Snapshotted at checkout so a later price change doesn't rewrite past orders.
    productsTotal: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 }, // box.price + productsTotal
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