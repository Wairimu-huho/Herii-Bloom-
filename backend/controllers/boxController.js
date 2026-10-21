const Box = require("../models/Box");
const Product = require("../models/Product");
const { resolveBoxCategories } = require("../utils/catalog");

// @route GET /api/boxes
const getBoxes = async (req, res) => {
  try {
    const boxes = await Box.find({ active: true }).lean();
    const result = await Promise.all(boxes.map(async (box) => {
      const categories = await resolveBoxCategories(box);
      const products = await Product.find({ category: { $in: categories.map((c) => c.key) }, active: true, archived: { $ne: true }, inStock: true }).select("name category").lean();
      return { ...box, categoryDefinitions: categories, items: products.map((product) => product.name) };
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/boxes  (admin only — used to set up your two tiers)
const createBox = async (req, res) => {
  try {
    const box = await Box.create(req.body);
    res.status(201).json(box);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/boxes/:id  (admin only — e.g. updating categories, price, items)
const updateBox = async (req, res) => {
  try {
    const box = await Box.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!box) return res.status(404).json({ message: "Box not found" });
    res.json(box);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/boxes/:id  (admin only)
const deleteBox = async (req, res) => {
  try {
    const box = await Box.findByIdAndDelete(req.params.id);
    if (!box) return res.status(404).json({ message: "Box not found" });
    res.json({ message: "Box deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBoxes, createBox, updateBox, deleteBox };
