const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { initializePaystackTransaction, verifyPaystackTransaction } = require("../services/paymentService");

async function releaseInventory(order) {
  const quantities = (order.selections || []).reduce((all, item) => { all[String(item.product)] = (all[String(item.product)] || 0) + Number(item.quantity || 1); return all; }, {});
  for (const [productId, quantity] of Object.entries(quantities)) await Product.updateOne({ _id: productId, inventory: { $ne: null } }, { $inc: { inventory: quantity }, $set: { inStock: true } });
}

async function markPaymentFailed(orderId, reason) {
  const order = await Order.findById(orderId);
  if (!order || ["paid", "failed"].includes(order.paymentStatus)) return order;
  order.paymentStatus = "failed";
  order.paymentFailureReason = reason || "Payment was not completed";
  await order.save();
  await releaseInventory(order);
  return order;
}

async function markPaymentPaid(order, reference) {
  if (order.paymentStatus === "paid") return order;
  order.paymentStatus = "paid";
  order.status = "active";
  order.paidAt = new Date();
  order.paymentReference = reference || order.paymentReference;
  await order.save();
  return order;
}

const initiatePayment = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id }).populate("user", "email name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "paid") return res.json({ order, status: "paid" });
    order.paymentMethod = "paystack";
    order.paymentStatus = "pending";
    order.paymentFailureReason = "";
    const transaction = await initializePaystackTransaction({ order, clientUrl: process.env.CLIENT_URL || "http://localhost:5173" });
    order.paymentReference = transaction.reference;
    await order.save();
    res.json({ orderId: order._id, provider: "paystack", status: "pending", checkoutUrl: transaction.authorization_url, reference: transaction.reference });
  } catch (error) {
    if (req.body?.orderId) await markPaymentFailed(req.body.orderId, error.message);
    res.status(400).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    const reference = req.query.reference || order.paymentReference;
    const result = await verifyPaystackTransaction(reference);
    const data = result.data;
    const expectedAmount = Math.round(Number(order.totalPrice) * 100);
    const expectedCurrency = process.env.PAYSTACK_CURRENCY || "KES";
    if (data.status !== "success" || Number(data.amount) !== expectedAmount || data.currency !== expectedCurrency) {
      await markPaymentFailed(order._id, "Paystack payment could not be verified");
      return res.status(400).json({ message: "Payment could not be verified", paymentStatus: "failed" });
    }
    await markPaymentPaid(order, data.reference);
    res.json(order);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const getPaymentStatus = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id }).select("boxName paymentStatus paymentMethod paymentReference paymentFailureReason status totalPrice deliveries");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

const cancelPayment = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  await markPaymentFailed(order._id, "Customer cancelled payment");
  res.json({ ok: true });
};

const paystackWebhook = async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "").update(rawBody).digest("hex");
  if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json({ message: "Invalid Paystack signature" });
  res.sendStatus(200);
  try {
    const event = req.body;
    if (event.event === "charge.success") {
      const data = event.data;
      const orderId = data.metadata?.orderId || (() => { try { return JSON.parse(data.metadata || "{}").orderId; } catch { return null; } })();
      if (!orderId) return;
      const order = await Order.findById(orderId);
      if (!order) return;
      const expectedAmount = Math.round(Number(order.totalPrice) * 100);
      const expectedCurrency = process.env.PAYSTACK_CURRENCY || "KES";
      if (data.status === "success" && Number(data.amount) === expectedAmount && data.currency === expectedCurrency) await markPaymentPaid(order, data.reference);
    }
  } catch (error) { console.error("Paystack webhook processing error:", error.message); }
};

module.exports = { initiatePayment, verifyPayment, getPaymentStatus, cancelPayment, paystackWebhook };
