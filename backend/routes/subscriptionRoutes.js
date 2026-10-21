const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createOrder, getMyOrders, getAllOrders } = require("../controllers/orderController");

// Compatibility aliases: the data model is now an order, even when the old URL is used.
router.post("/", protect, createOrder);
router.get("/me", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);

module.exports = router;
