const Order = require("../models/Order");
const Box = require("../models/Box");
const Product = require("../models/Product");
const StoreSettings = require("../models/StoreSettings");
const { resolveBoxCategories } = require("../utils/catalog");

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

  const products = await Product.find({ _id: { $in: selections.map((s) => s.productId) }, active: true, archived: false, inStock: true });
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
    const { boxId, purchaseType = "one_time", selections = [], deliveryAddress, phone, gift = {}, cardMessage = "", firstDeliveryDate, cancellationAccepted } = req.body;
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
      deliveries: priced.deliveries,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
const getAllOrders = async (req, res) => res.json(await Order.find().populate("user", "name email phone").sort({ createdAt: -1 }));

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

module.exports = { createOrder, getMyOrders, getAllOrders, reorder, cancelOrder, postponeOrder };
