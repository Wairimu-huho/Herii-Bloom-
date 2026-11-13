const express = require("express");
const multer = require("multer");
const router = express.Router();
const { getProducts, getAllProducts, createProduct, updateProduct, uploadProductPhoto, deleteProduct } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return callback(null, true);
    callback(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
  },
});

router.get("/", getProducts);
router.get("/admin", protect, adminOnly, getAllProducts);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.post("/:id/photos", protect, adminOnly, upload.single("photo"), uploadProductPhoto);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
