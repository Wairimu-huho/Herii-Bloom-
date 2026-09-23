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

module.exports = { getBoxes, createBox };
