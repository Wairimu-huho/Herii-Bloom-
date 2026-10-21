const Review = require("../models/Review");
const Order = require("../models/Order");
const Box = require("../models/Box");
const Product = require("../models/Product");
const { checkContent, REPORT_THRESHOLD } = require("../utils/moderation");

const testMode = () => process.env.NODE_ENV !== "production" && process.env.REVIEW_TEST_MODE !== "false";

const hasDeliveredOrder = (order) => Boolean(order?.deliveries?.some((delivery) => delivery.status === "delivered"));

const getReviews = async (req, res) => {
  try {
    const filter = { status: "published" };
    if (req.query.boxId) filter.box = req.query.boxId;
    if (req.query.productId) filter["products.product"] = req.query.productId;
    const reviews = await Review.find(filter).populate("user", "name").sort({ createdAt: -1 }).lean();
    const summary = reviews.reduce((result, review) => {
      result.count += 1;
      result.total += review.rating;
      result.byRating[review.rating] = (result.byRating[review.rating] || 0) + 1;
      review.products.forEach((product) => {
        const item = result.products[product.product] || { name: product.productName, count: 0, total: 0 };
        item.count += 1;
        item.total += review.rating;
        item.average = Number((item.total / item.count).toFixed(1));
        result.products[product.product] = item;
      });
      return result;
    }, { count: 0, total: 0, byRating: {}, products: {} });
    summary.average = summary.count ? Number((summary.total / summary.count).toFixed(1)) : 0;
    res.json({ reviews, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEligibleReviews = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    const eligibleOrders = testMode() ? orders : orders.filter(hasDeliveredOrder);
    if (testMode() && !eligibleOrders.length) {
      const boxes = await Box.find({ active: true }).select("_id name").lean();
      const products = await Product.find({ active: true, archived: { $ne: true } }).select("_id name category").lean();
      return res.json({ testMode: true, options: boxes.map((box) => ({ box, products })) });
    }
    const options = await Promise.all(eligibleOrders.map(async (order) => {
      const productIds = [...new Set((order.selections || []).map((selection) => String(selection.product)))];
      const products = await Product.find({ _id: { $in: productIds } }).select("_id name category").lean();
      return { orderId: order._id, verifiedBuyer: hasDeliveredOrder(order), box: { _id: order.box, name: order.boxName }, products };
    }));
    res.json({ testMode: testMode(), options });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { orderId, boxId, productIds = [], rating, text } = req.body;
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    if (!text?.trim()) return res.status(400).json({ message: "Review text is required" });
    const content = checkContent(text);
    const order = orderId ? await Order.findOne({ _id: orderId, user: req.user._id }) : null;
    const verifiedBuyer = hasDeliveredOrder(order);
    if (!verifiedBuyer && !testMode()) return res.status(403).json({ message: "Reviews are available after your box has been delivered" });
    const box = await Box.findById(boxId).select("name");
    if (!box) return res.status(404).json({ message: "Box not found" });
    const products = await Product.find({ _id: { $in: productIds } }).select("_id name").lean();
    const review = await Review.create({ user: req.user._id, order: order?._id, box: box._id, boxName: box.name, products: products.map((product) => ({ product: product._id, productName: product.name })), rating: numericRating, text: text.trim(), verifiedBuyer, flaggedByFilter: content.flaggedByFilter, status: content.flaggedByFilter ? "hidden" : "published" });
    res.status(201).json({ review, message: content.flaggedByFilter ? "Your review was submitted for moderation" : "Review submitted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.reports.some((report) => String(report.user) === String(req.user._id))) return res.status(400).json({ message: "You have already reported this review" });
    review.reports.push({ user: req.user._id, reason: req.body.reason || "Inappropriate content" });
    if (review.reports.length >= REPORT_THRESHOLD) review.status = "hidden";
    await review.save();
    res.json({ message: review.status === "hidden" ? "Review hidden pending moderation" : "Review reported" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const moderateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getReviews, getEligibleReviews, createReview, reportReview, moderateReview };
