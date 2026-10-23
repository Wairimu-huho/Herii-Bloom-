const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    hours: { type: String, trim: true, default: "Monday–Friday, 9:00 AM–5:00 PM" },
    instagram: { type: String, trim: true, default: "heribloom" },
    tiktok: { type: String, trim: true, default: "heribloom" },
    facebook: { type: String, trim: true, default: "heribloom" },
    twitter: { type: String, trim: true, default: "heribloom" },
  },
  { _id: false }
);

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
    contact: { type: contactSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
