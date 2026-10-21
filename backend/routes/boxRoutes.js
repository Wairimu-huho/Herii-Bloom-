const express = require("express");
const router = express.Router();
const { getBoxes, getAllBoxes, createBox, updateBox, deleteBox } = require("../controllers/boxController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getBoxes);
router.get("/admin", protect, adminOnly, getAllBoxes);
router.post("/", protect, adminOnly, createBox);
router.put("/:id", protect, adminOnly, updateBox);
router.delete("/:id", protect, adminOnly, deleteBox);

module.exports = router;
