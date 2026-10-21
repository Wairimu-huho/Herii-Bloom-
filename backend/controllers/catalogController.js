const Category = require("../models/Category");
const StoreSettings = require("../models/StoreSettings");

const getCategories = async (req, res) => {
  try {
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
    const settings = await StoreSettings.findOneAndUpdate(
      { key: "store" },
      { $set: req.body },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, getSettings, updateSettings };
