const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getCategories, createCategory, updateCategory, getSettings, updateSettings } = require("../controllers/catalogController");

router.get("/categories", getCategories);
router.post("/categories", protect, adminOnly, createCategory);
router.put("/categories/:id", protect, adminOnly, updateCategory);
router.get("/settings", getSettings);
router.put("/settings", protect, adminOnly, updateSettings);

module.exports = router;
