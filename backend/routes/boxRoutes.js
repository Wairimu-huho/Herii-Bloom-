const express = require("express");
const router = express.Router();
const { getBoxes, createBox } = require("../controllers/boxController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getBoxes);
router.post("/", protect, adminOnly, createBox);

module.exports = router;
