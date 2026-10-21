const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createOrder, createStandaloneAddonOrder, getMyOrders, getAllOrders, reorder, cancelOrder, postponeOrder } = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.post("/addon", protect, createStandaloneAddonOrder);
router.get("/me", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.get("/:id/reorder", protect, reorder);
router.post("/:id/cancel", protect, cancelOrder);
router.post("/:id/postpone", protect, postponeOrder);

module.exports = router;