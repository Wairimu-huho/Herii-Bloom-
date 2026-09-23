const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getMySubscriptions,
  getAllSubscriptions,
  updateSubscription,
} = require("../controllers/subscriptionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createSubscription);
router.get("/me", protect, getMySubscriptions);
router.get("/", protect, adminOnly, getAllSubscriptions); // this list = your tracking sheet
router.put("/:id", protect, adminOnly, updateSubscription);

module.exports = router;
