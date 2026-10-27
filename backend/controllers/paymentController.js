const Order = require("../models/Order");
const Product = require("../models/Product");
const { createStripeCheckout, createMpesaStkPush } = require("../services/paymentService");

async function releaseInventory(order) {
  const quantities = (order.selections || []).reduce((all, item) => { all[String(item.product)] = (all[String(item.product)] || 0) + Number(item.quantity || 1); return all; }, {});
  for (const [productId, quantity] of Object.entries(quantities)) { await Product.updateOne({ _id: productId, inventory: { $ne: null } }, { $inc: { inventory: quantity }, $set: { inStock: true } }); }
}

async function markPaymentFailed(orderId, reason) {
  const order = await Order.findById(orderId);
  if (!order || ["paid", "failed"].includes(order.paymentStatus)) return order;
  order.paymentStatus = "failed"; order.paymentFailureReason = reason || "Payment was not completed"; await order.save(); await releaseInventory(order); return order;
}

const initiatePayment = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id }).populate("user", "email name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "paid") return res.json({ order, status: "paid" });
    const method = req.body.paymentMethod;
    if (!["mpesa", "stripe"].includes(method)) return res.status(400).json({ message: "Choose M-Pesa or Stripe" });
    order.paymentMethod = method; order.paymentStatus = "pending"; order.paymentFailureReason = "";
    if (method === "stripe") { const session = await createStripeCheckout({ order, clientUrl: process.env.CLIENT_URL || "http://localhost:5173" }); order.paymentReference = session.id; await order.save(); return res.json({ orderId: order._id, provider: "stripe", status: "pending", checkoutUrl: session.url }); }
    const result = await createMpesaStkPush({ order }); order.paymentReference = result.CheckoutRequestID || result.MerchantRequestID || ""; await order.save(); return res.json({ orderId: order._id, provider: "mpesa", status: "pending", message: "A payment prompt has been sent to your phone." });
  } catch (error) { if (req.body?.orderId) await markPaymentFailed(req.body.orderId, error.message); res.status(400).json({ message: error.message }); }
};

const getPaymentStatus = async (req, res) => { const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id }).select("boxName paymentStatus paymentMethod paymentReference paymentFailureReason status totalPrice deliveries"); if (!order) return res.status(404).json({ message: "Order not found" }); res.json(order); };

const mpesaCallback = async (req, res) => { res.json({ ResultCode: 0, ResultDesc: "Accepted" }); try { const callback = req.body?.Body?.stkCallback; if (!callback) return; const order = await Order.findOne({ paymentReference: callback.CheckoutRequestID }); if (!order) return; if (Number(callback.ResultCode) === 0) { const receipt = callback.CallbackMetadata?.Item?.find((item) => item.Name === "MpesaReceiptNumber")?.Value; order.paymentStatus = "paid"; order.status = "active"; order.paidAt = new Date(); order.paymentReference = receipt || order.paymentReference; await order.save(); } else await markPaymentFailed(order._id, callback.ResultDesc); } catch (error) { console.error("M-Pesa callback error:", error.message); } };

const cancelPayment = async (req, res) => { const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id }); if (!order) return res.status(404).json({ message: "Order not found" }); await markPaymentFailed(order._id, "Customer cancelled payment"); res.json({ ok: true }); };
const stripeWebhook = async (req, res) => { try { const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body; if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") { const session = event.data.object; const orderId = session.metadata?.orderId; if (orderId) await Order.findByIdAndUpdate(orderId, { paymentStatus: "paid", status: "active", paidAt: new Date(), paymentReference: session.payment_intent || session.id }); } if (event.type === "checkout.session.async_payment_failed") { const orderId = event.data.object.metadata?.orderId; if (orderId) await markPaymentFailed(orderId, "Stripe payment failed"); } res.json({ received: true }); } catch (error) { res.status(400).json({ message: error.message }); } };

module.exports = { initiatePayment, getPaymentStatus, mpesaCallback, stripeWebhook, cancelPayment };
