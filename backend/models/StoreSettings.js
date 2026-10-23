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

const aboutSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, trim: true, default: "OUR STORY" },
    title: { type: String, trim: true, default: "Care that sees the whole you." },
    intro: { type: String, trim: true, default: "Heri Bloom makes menstrual health feel more supported, more comfortable, and more like an everyday act of self-care." },
    storyHeading: { type: String, trim: true, default: "More than a monthly box" },
    story: { type: String, trim: true, default: "We believe your period should never make you feel like an afterthought. Heri Bloom brings thoughtful essentials, comforting extras, and real support together in one considered ritual." },
    missionHeading: { type: String, trim: true, default: "Our mission" },
    mission: { type: String, trim: true, default: "To make menstrual care easier to access and nicer to experience, while creating space for every person to feel seen, prepared, and cared for." },
    promiseHeading: { type: String, trim: true, default: "Our promise to you" },
    promise: { type: String, trim: true, default: "Every box is chosen with comfort, dignity, and joy in mind—from the essentials you need to the small details that help you feel like yourself." },
    ctaTitle: { type: String, trim: true, default: "Build a ritual that feels like you." },
    ctaText: { type: String, trim: true, default: "Choose your essentials, add a little comfort, and let Heri Bloom meet you where you are." },
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
    about: { type: aboutSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
