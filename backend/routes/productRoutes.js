const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const { getProducts, getAllProducts, createProduct, updateProduct, uploadProductPhoto, deleteProduct } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const uploadDirectory = path.join(__dirname, "../uploads/products");
fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => callback(null, `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});

router.get("/", getProducts);
router.get("/admin", protect, adminOnly, getAllProducts);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.post("/:id/photos", protect, adminOnly, upload.single("photo"), uploadProductPhoto);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;