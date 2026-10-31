const Order = require("../models/Order");
const Box = require("../models/Box");
const Product = require("../models/Product");
const StoreSettings = require("../models/StoreSettings");
const { resolveBoxCategories } = require("../utils/catalog");
const crypto = require("crypto");
const { sendDeliveryDeliveredEmail } = require("../services/emailService");

const dateOnly = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function getStoreSettings() {
  return StoreSettings.findOneAndUpdate({ key: "store" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
}

function makeDates(firstDate, count, settings) {
  const dates = [];
  let cursor = dateOnly(firstDate);
  const earliest = dateOnly(settings.earliestBookableDate);
  if (cursor < earliest) cursor = earliest;
  while (dates.length < count) {
    if (!settings.noDeliveryWeekdays.includes(cursor.getDay())) dates.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return dates;
}

async function validateAndPrice({ box, selections, purchaseType, firstDeliveryDate }) {
  const categories = await resolveBoxCategories(box);
  const categoryMap = Object.fromEntries(categories.map((c) => [c.key, c]));
  const byCategory = {};
  for (const selection of selections) {
    if (!categoryMap[selection.category]) throw new Error(`This box does not offer ${selection.category}`);
    if (!byCategory[selection.category]) byCategory[selection.category] = [];
    byCategory[selection.category].push(selection);
  }
  for (const category of categories) {
    const entries = byCategory[category.key] || [];
    const quantity = entries.reduce((sum, entry) => sum + Number(entry.quantity || 1), 0);
    const max = category.maxSelections === null || category.maxSelections === undefined ? Infinity : category.maxSelections;
    if (quantity < category.minSelections || quantity > max) {
      throw new Error(`${category.name} requires ${category.minSelections === max ? `exactly ${category.minSelections}` : `between ${category.minSelections} and ${max}`} selection(s)`);
    }
    if (!category.allowRepeat && new Set(entries.map((entry) => String(entry.productId))).size !== entries.length) {
      throw new Error(`${category.name} does not allow repeated products`);
    }
  }
  const groups = {};
  categories.filter((c) => c.atLeastOneGroup).forEach((c) => {
    groups[c.atLeastOneGroup] ||= [];
    groups[c.atLeastOneGroup].push(c.key);
  });
  for (const keys of Object.values(groups)) {
    if (!keys.some((key) => (byCategory[key] || []).length)) throw new Error(`Please choose at least one option from: ${keys.join(" or ")}`);
  }

  const products = await Product.find({ _id: { $in: selections.map((s) => s.productId) }, active: true, archived: false, inStock: true }).select("name category priceModifier inventory");
  const productMap = Object.fromEntries(products.map((p) => [String(p._id), p]));
  let productsTotal = 0;
  const snapshots = selections.map((selection) => {
    const product = productMap[String(selection.productId)];
    if (!product) throw new Error("One of your selected products is no longer available");
    if (product.category !== selection.category) throw new Error(`${product.name} does not belong to ${selection.category}`);
    const quantity = Number(selection.quantity || 1);
    productsTotal += product.priceModifier * quantity;
    return {
      category: selection.category,
      product: product._id,
      productName: product.name,
      unitPriceModifier: product.priceModifier,
      quantity,
    };
  });
  const automaticCategories = categories.filter((category) => category.includedAutomatically);
  let automaticProducts = [];
  if (automaticCategories.length) {
    automaticProducts = await Product.find({ category: { $in: automaticCategories.map((category) => category.key) }, active: true, archived: false, inStock: true }).select("name category priceModifier inventory");
    automaticProducts.forEach((product) => {
      productsTotal += product.priceModifier;
      snapshots.push({ category: product.category, product: product._id, productName: product.name, unitPriceModifier: product.priceModifier, quantity: 1 });
    });
  }
  const inventoryProducts = new Map([...products, ...automaticProducts].map((product) => [String(product._id), product]));
  const requestedQuantities = snapshots.reduce((all, snapshot) => { all[String(snapshot.product)] = (all[String(snapshot.product)] || 0) + snapshot.quantity; return all; }, {});
  Object.entries(requestedQuantities).forEach(([productId, quantity]) => {
    const product = inventoryProducts.get(productId);
    if (product?.inventory !== null && product?.inventory !== undefined && quantity > product.inventory) throw new Error(`${product.name} only has ${product.inventory} available`);
  });
  const settings = await getStoreSettings();
  const count = purchaseType === "three_month" ? 3 : 1;
  const discountPercent = purchaseType === "three_month" ? settings.discountPercent : 0;
  const eligibleProductTotal = settings.discountAppliesToAddons
    ? productsTotal
    : snapshots.filter((s) => !categoryMap[s.category]?.optionalExtra).reduce((sum, s) => sum + s.unitPriceModifier * s.quantity, 0);
  const baseTotal = box.price + productsTotal;
  const discountAmount = Math.round(((box.price + eligibleProductTotal) * discountPercent) / 100);
  const firstDates = makeDates(firstDeliveryDate || settings.earliestBookableDate, count, settings);
  const deliveries = firstDates.map((scheduledDate, index) => ({
    sequence: index + 1,
    scheduledDate,
    selections: snapshots,
    boxPrice: box.price,
    productsTotal,
    discountAmount: count === 3 ? discountAmount : 0,
    totalPrice: count === 3 ? baseTotal - discountAmount : baseTotal,
  }));
  return { snapshots, productsTotal, discountPercent, discountAmount, totalPrice: deliveries.reduce((sum, d) => sum + d.totalPrice, 0), deliveries, settings };
}

const createOrder = async (req, res) => {
  try {
    const { boxId, purchaseType = "one_time", selections = [], deliveryAddress, phone, gift = {}, cardMessage = "", firstDeliveryDate, cancellationAccepted, notificationPreferences = {} } = req.body;
    if (!phone?.trim()) return res.status(400).json({ message: "Phone number is required" });
    if (!deliveryAddress?.street?.trim() || !deliveryAddress?.city?.trim()) return res.status(400).json({ message: "Street and city are required" });
    if (gift.isGift && (!gift.recipientName?.trim() || !gift.recipientPhone?.trim())) return res.status(400).json({ message: "Gift recipient name and phone are required" });
    if (cardMessage.length > 240) return res.status(400).json({ message: "Card message must be 240 characters or fewer" });
    if (purchaseType === "three_month" && cancellationAccepted !== true) return res.status(400).json({ message: "Please accept the three-month cancellation policy" });
    const box = await Box.findById(boxId);
    if (!box || !box.active) return res.status(404).json({ message: "Box not found" });
    const priced = await validateAndPrice({ box, selections, purchaseType, firstDeliveryDate });
    for (const delivery of priced.deliveries) {
      const start = dateOnly(delivery.scheduledDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const alreadyBooked = await Order.countDocuments({
        status: { $ne: "cancelled" },
        "deliveries.scheduledDate": { $gte: start, $lt: end },
      });
      if (alreadyBooked >= priced.settings.maxBoxesPerDay) {
        return res.status(400).json({ message: `That delivery date is full. Please choose another date.` });
      }
    }
    const order = await Order.create({
      status: "awaiting_payment",
      user: req.user._id,
      box: box._id,
      boxName: box.name,
      boxPrice: box.price,
      purchaseType,
      selections: priced.snapshots,
      productsTotal: priced.productsTotal,
      discountPercent: priced.discountPercent,
      discountAmount: priced.discountAmount,
      totalPrice: priced.totalPrice,
      deliveryAddress,
      phone,
      gift: gift.isGift ? { isGift: true, recipientName: gift.recipientName, recipientPhone: gift.recipientPhone } : { isGift: false },
      cardMessage,
      cancellationAccepted: Boolean(cancellationAccepted),
      notificationPreferences: { email: notificationPreferences.email !== false, whatsapp: notificationPreferences.whatsapp === true },
      deliveries: priced.deliveries,
    });
    for (const [productId, quantity] of Object.entries(priced.snapshots.reduce((all, snapshot) => { all[String(snapshot.product)] = (all[String(snapshot.product)] || 0) + snapshot.quantity; return all; }, {}))) {
      await Product.updateOne({ _id: productId, inventory: { $ne: null } }, { $inc: { inventory: -quantity } });
      await Product.updateOne({ _id: productId, inventory: 0 }, { $set: { inStock: false } });
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createStandaloneAddonOrder = async (req, res) => {
  try {
    const { productId, quantity = 1, deliveryAddress, phone, firstDeliveryDate, notificationPreferences = {} } = req.body;
    const requestedQuantity = Number(quantity);
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) return res.status(400).json({ message: "Quantity must be at least 1" });
    if (!phone?.trim()) return res.status(400).json({ message: "Phone number is required" });
    if (!deliveryAddress?.street?.trim() || !deliveryAddress?.city?.trim()) return res.status(400).json({ message: "Street and city are required" });
    const product = await Product.findOne({ _id: productId, category: { $in: ["addon", "addons", "add-ons"] }, active: true, archived: false, inStock: true }).select("name category standalonePrice inventory");
    if (!product || product.standalonePrice === null || product.standalonePrice === undefined) return res.status(400).json({ message: "This add-on is not available as a standalone purchase" });
    if (product.inventory !== null && product.inventory !== undefined && requestedQuantity > product.inventory) return res.status(400).json({ message: `${product.name} only has ${product.inventory} available` });
    const settings = await getStoreSettings();
    const scheduledDate = makeDates(firstDeliveryDate || settings.earliestBookableDate, 1, settings)[0];
    const start = dateOnly(scheduledDate); const end = new Date(start); end.setDate(end.getDate() + 1);
    const alreadyBooked = await Order.countDocuments({ status: { $ne: "cancelled" }, "deliveries.scheduledDate": { $gte: start, $lt: end } });
    if (alreadyBooked >= settings.maxBoxesPerDay) return res.status(400).json({ message: "That delivery date is full. Please choose another date." });
    const total = product.standalonePrice * requestedQuantity;
    const selection = { category: product.category, product: product._id, productName: product.name, unitPriceModifier: product.standalonePrice, quantity: requestedQuantity };
    const order = await Order.create({ status: "awaiting_payment", user: req.user._id, orderType: "standalone_addon", boxName: `Standalone: ${product.name}`, boxPrice: 0, purchaseType: "one_time", selections: [selection], productsTotal: total, totalPrice: total, deliveryAddress, phone, cancellationAccepted: true, notificationPreferences: { email: notificationPreferences.email !== false, whatsapp: notificationPreferences.whatsapp === true }, deliveries: [{ sequence: 1, scheduledDate, selections: [selection], boxPrice: 0, productsTotal: total, totalPrice: total }] });
    await Product.updateOne({ _id: product._id, inventory: { $ne: null } }, { $inc: { inventory: -requestedQuantity } });
    await Product.updateOne({ _id: product._id, inventory: 0 }, { $set: { inStock: false } });
    res.status(201).json(order);
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const getMyOrders = async (req, res) => res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
const getAllOrders = async (req, res) => res.json(await Order.find().populate("user", "name email phone").sort({ createdAt: -1 }));


const createDeliveryToken = () => crypto.randomBytes(32).toString("hex");
const hashDeliveryToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const publicDelivery = (order, delivery, token) => ({ orderNumber: order.orderNumber, boxName: order.boxName, status: delivery.status, sequence: delivery.sequence, scheduledDate: delivery.scheduledDate, totalPrice: delivery.totalPrice, gift: Boolean(order.gift?.isGift), deliveredAt: delivery.deliveredAt, customerAcknowledgedAt: delivery.customerAcknowledgedAt, problemReportedAt: delivery.problemReportedAt, problemText: delivery.problemText, deliveryToken: token });

const updateDeliveryStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("+deliveries.deliveryAccessToken +deliveries.deliveryAccessTokenHash");
    if (!order) return res.status(404).json({ message: "Order not found" });
    const delivery = order.deliveries.id(req.body.deliveryId) || order.deliveries.find((item) => item.sequence === Number(req.body.sequence));
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    const wasDelivered = delivery.status === "delivered";
    const allowed = ["scheduled", "preparing", "out_for_delivery", "delivered", "problem", "cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid delivery status" });
    delivery.status = req.body.status;
    let token = null;
    if (req.body.status === "delivered") {
      delivery.deliveredAt = new Date();
      if (!delivery.deliveryAccessToken) { token = createDeliveryToken(); delivery.deliveryAccessToken = token; delivery.deliveryAccessTokenHash = hashDeliveryToken(token); }
      order.status = order.deliveries.some((item) => ["scheduled", "preparing", "out_for_delivery"].includes(item.status)) ? "active" : "delivered";
    } else if (req.body.status === "preparing") order.status = "preparing";
    else if (req.body.status === "out_for_delivery") order.status = "out_for_delivery";
    else if (req.body.status === "problem") order.status = "problem";
    await order.save();
    if (req.body.status === "delivered" && !wasDelivered) sendDeliveryDeliveredEmail(order, delivery, token || delivery.deliveryAccessToken).catch((error) => console.error("Delivery email failed:", error.message));
    res.json({ order, deliveryLink: token ? `${process.env.CLIENT_URL || ""}/delivery/${token}` : null });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const findDeliveryByToken = async (token) => {
  const hash = hashDeliveryToken(token);
  const order = await Order.findOne({ "deliveries.deliveryAccessTokenHash": hash }).select("+deliveries.deliveryAccessToken +deliveries.deliveryAccessTokenHash");
  if (!order) return null;
  return { order, delivery: order.deliveries.find((item) => item.deliveryAccessTokenHash === hash) };
};
const getDeliveryByToken = async (req, res) => {
  const found = await findDeliveryByToken(req.params.token);
  if (!found) return res.status(404).json({ message: "Delivery link is invalid or expired" });
  res.json(publicDelivery(found.order, found.delivery));
};
const confirmDeliveryByToken = async (req, res) => {
  const found = await findDeliveryByToken(req.params.token);
  if (!found) return res.status(404).json({ message: "Delivery link is invalid or expired" });
  found.delivery.customerAcknowledgedAt = new Date();
  if (found.delivery.status === "delivered" && found.order.deliveries.every((item) => item.status === "delivered" || item.status === "cancelled")) found.order.status = "delivered";
  await found.order.save();
  res.json(publicDelivery(found.order, found.delivery));
};
const reportDeliveryProblem = async (req, res) => {
  const found = await findDeliveryByToken(req.params.token);
  if (!found) return res.status(404).json({ message: "Delivery link is invalid or expired" });
  found.delivery.status = "problem";
  found.delivery.problemReportedAt = new Date();
  found.delivery.problemText = String(req.body.problemText || "Delivery issue reported").slice(0, 1000);
  found.order.status = "problem";
  await found.order.save();
  res.json(publicDelivery(found.order, found.delivery));
};

const reorder = async (req, res) => {
  const original = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!original) return res.status(404).json({ message: "Order not found" });
  res.json({ boxId: original.box, purchaseType: original.purchaseType, selections: original.selections.map(({ category, product, quantity }) => ({ category, productId: product, quantity })), deliveryAddress: original.deliveryAddress, phone: original.phone, gift: original.gift, cardMessage: original.cardMessage });
};

const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  const settings = await getStoreSettings();
  const now = new Date();
  const next = order.deliveries.find((d) => ["scheduled", "shipped"].includes(d.status));
  const sameDayAfterCutoff = dateOnly(next?.scheduledDate || now).getTime() === dateOnly(now).getTime() && now.getHours() >= settings.cutoffHour;
  if (!next || next.status === "shipped" || sameDayAfterCutoff || dateOnly(next.scheduledDate) - dateOnly(now) < settings.changeWindowDays * 86400000) return res.status(400).json({ message: "This order is outside its change window or after the cutoff and cannot be cancelled" });
  order.status = "cancelled";
  order.cancelledAt = now;
  order.cancellationReason = req.body.reason;
  order.deliveries.forEach((d) => { if (d.status === "scheduled") d.status = "cancelled"; });
  await order.save();
  res.json(order);
};

const postponeOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  const settings = await getStoreSettings();
  const next = order.deliveries.find((d) => d.status === "scheduled");
  if (!next || dateOnly(next.scheduledDate) - dateOnly(new Date()) < settings.changeWindowDays * 86400000) return res.status(400).json({ message: "This order is outside its change window and cannot be postponed" });
  const requested = dateOnly(req.body.scheduledDate);
  if (settings.noDeliveryWeekdays.includes(requested.getDay()) || requested < dateOnly(settings.earliestBookableDate)) return res.status(400).json({ message: "That date is not available for delivery" });
  next.scheduledDate = requested;
  await order.save();
  res.json(order);
};

module.exports = { createOrder, createStandaloneAddonOrder, getMyOrders, getAllOrders, updateDeliveryStatus, getDeliveryByToken, confirmDeliveryByToken, reportDeliveryProblem, reorder, cancelOrder, postponeOrder };
