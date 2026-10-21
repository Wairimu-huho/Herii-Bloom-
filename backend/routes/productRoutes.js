const express = require("express");
const router = express.Router();
const { getProducts, getAllProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getProducts);
router.get("/admin", protect, adminOnly, getAllProducts);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
