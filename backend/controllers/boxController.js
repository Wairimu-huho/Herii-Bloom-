const Box = require("../models/Box");

// @route GET /api/boxes
const getBoxes = async (req, res) => {
  try {
    const boxes = await Box.find({ active: true });
    res.json(boxes);
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