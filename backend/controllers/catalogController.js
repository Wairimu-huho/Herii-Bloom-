const Category = require("../models/Category");
const StoreSettings = require("../models/StoreSettings");

const DEFAULT_CATEGORIES = [
  { key: "included", name: "Included essentials", minSelections: 0, maxSelections: 0, allowRepeat: false, optionalExtra: false, hasOptions: false, includedAutomatically: true },
  { key: "pads", name: "Pads", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false, atLeastOneGroup: "period-products", hasOptions: true },
  { key: "tampons", name: "Tampons", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false, atLeastOneGroup: "period-products", hasOptions: true },
  { key: "panty-liners", name: "Panty liners", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false, hasOptions: true },
  { key: "wipes", name: "Wipes", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false, hasOptions: true },
  { key: "chocolate", name: "Chocolate", minSelections: 1, maxSelections: 1, allowRepeat: false, optionalExtra: false, hasOptions: true },
  { key: "tea", name: "Teas", minSelections: 5, maxSelections: 5, allowRepeat: true, optionalExtra: false, hasOptions: true },
  { key: "candle", name: "Candles", minSelections: 1, maxSelections: 1, allowRepeat: false, optionalExtra: false, hasOptions: true },
  { key: "bath-bombs", name: "Bath bombs", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: true, hasOptions: true },
  { key: "essential-oils", name: "Essential oils", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: true, hasOptions: true },
  { key: "addon", name: "Add-ons", minSelections: 0, maxSelections: null, allowRepeat: false, optionalExtra: true, hasOptions: true },
];

const getCategories = async (req, res) => {
  try {
    await Promise.all(DEFAULT_CATEGORIES.map((category) => Category.updateOne({ key: category.key }, { $setOnInsert: category }, { upsert: true })));
    res.json(await Category.find({ active: true }).sort({ name: 1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    res.status(201).json(await Category.create(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const archiveCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category archived", category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await StoreSettings.findOneAndUpdate({ key: "store" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await StoreSettings.findOneAndUpdate({ key: "store" }, { $set: req.body }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, archiveCategory, getSettings, updateSettings, DEFAULT_CATEGORIES };