const Subscription = require("../models/Subscription");
const Box = require("../models/Box");
const Product = require("../models/Product");
const { SELECTION_RULES, REQUIRE_AT_LEAST_ONE_OF } = require("../utils/selectionRules");

// @route POST /api/subscriptions  (logged-in user subscribes to a box)
// Body: { boxId, deliveryAddress, selections: [{ category, productId, quantity }] }
const createSubscription = async (req, res) => {
  try {
    const { boxId, deliveryAddress, selections = [] } = req.body;

    const box = await Box.findById(boxId);
    if (!box || !box.active) {
      return res.status(404).json({ message: "Box not found" });
    }

    const requiredCategories = box.categories;

    const byCategory = {};
    for (const sel of selections) {
      if (!byCategory[sel.category]) byCategory[sel.category] = [];
      byCategory[sel.category].push(sel);
    }

    for (const category of requiredCategories) {
      const rule = SELECTION_RULES[category];
      const entries = byCategory[category] || [];
      const totalQty = entries.reduce((sum, e) => sum + (e.quantity || 1), 0);

      if (totalQty < rule.min || (rule.max !== null && totalQty > rule.max)) {
        const bound = rule.max === null ? `at least ${rule.min}` : `between ${rule.min} and ${rule.max}`;
        return res.status(400).json({
          message: `${category} requires ${bound} selection(s), got ${totalQty}`,
        });
      }

      if (!rule.allowRepeat) {
        const uniqueProducts = new Set(entries.map((e) => e.productId));
        if (uniqueProducts.size !== entries.length) {
          return res.status(400).json({
            message: `${category} does not allow choosing the same product more than once`,
          });
        }
        if (entries.some((e) => (e.quantity || 1) !== 1)) {
          return res.status(400).json({
            message: `${category} does not support custom quantities, each item is picked once`,
          });
        }
      }
    }

    const pairOffered = REQUIRE_AT_LEAST_ONE_OF.filter((c) => requiredCategories.includes(c));
    if (pairOffered.length > 0) {
      const pairTotal = pairOffered.reduce((sum, c) => sum + (byCategory[c] || []).length, 0);
      if (pairTotal < 1) {
        return res.status(400).json({
          message: `Please choose at least one of: ${pairOffered.join(" or ")}`,
        });
      }
    }

    for (const category of Object.keys(byCategory)) {
      if (!requiredCategories.includes(category)) {
        return res.status(400).json({ message: `This box does not offer ${category}` });
      }
    }

    const productIds = selections.map((s) => s.productId);
    const products = await Product.find({ _id: { $in: productIds }, active: true });
    const productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

    let productsTotal = 0;
    const resolvedSelections = [];

    for (const sel of selections) {
      const product = productMap[sel.productId];
      if (!product) {
        return res.status(400).json({ message: `Invalid or inactive product: ${sel.productId}` });
      }
      if (product.category !== sel.category) {
        return res.status(400).json({
          message: `Product ${product.name} does not belong to category ${sel.category}`,
        });
      }

      const quantity = sel.quantity || 1;
      productsTotal += product.priceModifier * quantity;

      resolvedSelections.push({ category: sel.category, product: product._id, quantity });
    }

    const totalPrice = box.price + productsTotal;

    const subscription = await Subscription.create({
      user: req.user._id,
      box: boxId,
      deliveryAddress,
      selections: resolvedSelections,
      productsTotal,
      totalPrice,
      status: "pending",
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/subscriptions/me
const getMySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id })
      .populate("box")
      .populate("selections.product");
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/subscriptions  (admin only)
const getAllSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find()
      .populate("user", "name email phone address")
      .populate("box", "name price")
      .populate("selections.product", "name category priceModifier")
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/subscriptions/:id  (admin only)
const updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSubscription, getMySubscriptions, getAllSubscriptions, updateSubscription };