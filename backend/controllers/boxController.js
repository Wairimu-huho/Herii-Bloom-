const Box = require("../models/Box");
const Product = require("../models/Product");
const { resolveBoxCategories } = require("../utils/catalog");

// Public shop catalog: active boxes with generated item lists.
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

const getAllBoxes = async (req, res) => {
  try {
    const boxes = await Box.find().sort({ active: -1, price: 1 }).lean();
    const result = await Promise.all(boxes.map(async (box) => ({ ...box, categoryDefinitions: await resolveBoxCategories(box) })));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBox = async (req, res) => {
  try {
    const box = await Box.create(req.body);
    res.status(201).json(box);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBox = async (req, res) => {
  try {
    const box = await Box.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!box) return res.status(404).json({ message: "Box not found" });
    res.json(box);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const uploadBoxPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Choose an image file first" });
    const box = await Box.findById(req.params.id);
    if (!box) return res.status(404).json({ message: "Box not found" });
    const baseUrl = process.env.API_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
    box.photos = [...(box.photos || []), { url: `${baseUrl}/uploads/boxes/${req.file.filename}`, alt: req.body.alt || `${box.name} photo`, sortOrder: box.photos?.length || 0, active: true }];
    await box.save();
    res.status(201).json(box);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBox = async (req, res) => {
  try {
    const box = await Box.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!box) return res.status(404).json({ message: "Box not found" });
    res.json({ message: "Box archived", box });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getBoxes, getAllBoxes, createBox, updateBox, uploadBoxPhoto, deleteBox };