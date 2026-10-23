const Product = require("../models/Product");
const isAddon = (category) => String(category || "").toLowerCase().replace(/[^a-z]/g, "") === "addon";

const getProducts = async (req, res) => {
  try {
    await Product.updateMany({ inStock: { $exists: false } }, { $set: { inStock: true } });
    await Product.updateMany({ archived: { $exists: false } }, { $set: { archived: false } });
    const { category } = req.query;
    const filter = { active: true, archived: { $ne: true }, inStock: true };
    if (category) filter.category = category;
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllProducts = async (req, res) => {
  try {
    await Product.updateMany({ inStock: { $exists: false } }, { $set: { inStock: true } });
    await Product.updateMany({ archived: { $exists: false } }, { $set: { archived: false } });
    await Product.updateMany({ hasOptions: { $exists: false } }, { $set: { hasOptions: true } });
    const products = await Product.find().sort({ archived: 1, category: 1, name: 1 });
    res.json(products);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProduct = async (req, res) => {
  try { const product = await Product.create(req.body); res.status(201).json(product); }
  catch (error) { res.status(400).json({ message: error.message }); }
};

const updateProduct = async (req, res) => {
  try {
    const current = await Product.findById(req.params.id).select("category");
    if (!current) return res.status(404).json({ message: "Product not found" });
    if (req.body.photos && !isAddon(req.body.category || current.category)) delete req.body.photos;
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const uploadProductPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Choose an image file first" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!isAddon(product.category)) return res.status(400).json({ message: "Photos are supported for Add-ons only" });
    const baseUrl = process.env.API_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
    product.photos = [...(product.photos || []), { url: `${baseUrl}/uploads/products/${req.file.filename}`, alt: req.body.alt || `${product.name} photo`, sortOrder: product.photos?.length || 0, active: true }];
    await product.save();
    res.status(201).json(product);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const archiveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false, archived: true }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product archived", product });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = { getProducts, getAllProducts, createProduct, updateProduct, uploadProductPhoto, deleteProduct: archiveProduct };