const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "store", unique: true },
    discountPercent: { type: Number, default: 10, min: 0, max: 100 },
    discountAppliesToAddons: { type: Boolean, default: true },
    earliestBookableDate: { type: Date, default: Date.now },
    noDeliveryWeekdays: { type: [Number], default: [0] },
    maxBoxesPerDay: { type: Number, default: 25, min: 1 },
    changeWindowDays: { type: Number, default: 3, min: 0 },
    cutoffHour: { type: Number, default: 12, min: 0, max: 23 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
