const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { initiatePayment, verifyPayment, getPaymentStatus, cancelPayment, paystackWebhook } = require("../controllers/paymentController");

router.post("/initiate", protect, initiatePayment);
router.get("/verify/:orderId", protect, verifyPayment);
router.get("/status/:orderId", protect, getPaymentStatus);
router.post("/cancel/:orderId", protect, cancelPayment);
router.post("/paystack/webhook", paystackWebhook);

module.exports = router;
