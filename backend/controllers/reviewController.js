const Review = require("../models/Review");
const Order = require("../models/Order");
const Box = require("../models/Box");
const Product = require("../models/Product");
const { checkContent, REPORT_THRESHOLD } = require("../utils/moderation");

const deliveredDeliveries = (order) => (order?.deliveries || []).filter((delivery) => delivery.status === "delivered");
const deliveredProducts = (order) => deliveredDeliveries(order).flatMap((delivery) => delivery.selections || order.selections || []);

const getReviews = async (req, res) => {
  try {
    const filter = { status: "published" };
    if (req.query.boxId) filter.box = req.query.boxId;
    if (req.query.productId) filter["products.product"] = req.query.productId;
    const reviews = await Review.find(filter).populate("user", "name").sort({ createdAt: -1 }).lean();
    const summary = reviews.reduce((result, review) => {
      result.count += 1; result.total += review.rating; result.byRating[review.rating] = (result.byRating[review.rating] || 0) + 1;
      review.products.forEach((product) => { const item = result.products[product.product] || { name: product.productName, count: 0, total: 0 }; item.count += 1; item.total += review.rating; item.average = Number((item.total / item.count).toFixed(1)); result.products[product.product] = item; });
      return result;
    }, { count: 0, total: 0, byRating: {}, products: {} });
    summary.average = summary.count ? Number((summary.total / summary.count).toFixed(1)) : 0;
    res.json({ reviews, summary });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getEligibleReviews = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    const deliveredOrders = orders.filter((order) => deliveredDeliveries(order).length);
    const existing = await Review.find({ user: req.user._id }).select("order box products reviewType").lean();
    const options = [];
    for (const order of deliveredOrders) {
      const orderReviews = existing.filter((review) => String(review.order) === String(order._id));
      const boxAlreadyReviewed = orderReviews.some((review) => review.reviewType === "box" || (!review.reviewType && !review.products?.length));
      const reviewedProducts = new Set(orderReviews.flatMap((review) => (review.products || []).map((product) => String(product.product))));
      const productIds = [...new Set(deliveredProducts(order).map((selection) => String(selection.product)))].filter((id) => !reviewedProducts.has(id));
      const products = await Product.find({ _id: { $in: productIds } }).select("_id name category").lean();
      if (!boxAlreadyReviewed || products.length) options.push({ orderId: order._id, verifiedBuyer: true, box: { _id: order.box, name: order.boxName }, boxAvailable: !boxAlreadyReviewed, products });
    }
    res.json({ testMode: false, options });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createReview = async (req, res) => {
  try {
    const { orderId, boxId, productIds = [], rating, text } = req.body;
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    if (!text?.trim()) return res.status(400).json({ message: "Review text is required" });
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order || !deliveredDeliveries(order).length) return res.status(403).json({ message: "Reviews are available only after your box has been delivered" });
    if (String(order.box) !== String(boxId)) return res.status(403).json({ message: "This box was not part of the delivered order" });
    const box = await Box.findById(boxId).select("name");
    if (!box) return res.status(404).json({ message: "Box not found" });
    const orderReviews = await Review.find({ user: req.user._id, order: order._id }).select("reviewType products").lean();
    const content = checkContent(text);
    const uniqueProductIds = [...new Set(productIds.map(String))];
    const deliveredIds = new Set(deliveredProducts(order).map((selection) => String(selection.product)));
    if (uniqueProductIds.some((id) => !deliveredIds.has(id))) return res.status(403).json({ message: "You can only review products from this delivered order" });
    if (!uniqueProductIds.length && orderReviews.some((review) => review.reviewType === "box" || (!review.reviewType && !review.products?.length))) return res.status(400).json({ message: "You have already reviewed this delivered box" });
    const previouslyReviewed = new Set(orderReviews.flatMap((review) => (review.products || []).map((product) => String(product.product))));
    if (uniqueProductIds.some((id) => previouslyReviewed.has(id))) return res.status(400).json({ message: "You can only review each delivered product once" });
    const products = await Product.find({ _id: { $in: uniqueProductIds } }).select("_id name").lean();
    const review = await Review.create({ user: req.user._id, order: order._id, box: box._id, boxName: box.name, reviewType: uniqueProductIds.length ? "products" : "box", products: products.map((product) => ({ product: product._id, productName: product.name })), rating: numericRating, text: text.trim(), verifiedBuyer: true, flaggedByFilter: content.flaggedByFilter, status: content.flaggedByFilter ? "hidden" : "published" });
    res.status(201).json({ review, message: content.flaggedByFilter ? "Your review was submitted for moderation" : "Review submitted" });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.reports.some((report) => String(report.user) === String(req.user._id))) return res.status(400).json({ message: "You have already reported this review" });
    review.reports.push({ user: req.user._id, reason: req.body.reason || "Inappropriate content" }); if (review.reports.length >= REPORT_THRESHOLD) review.status = "hidden"; await review.save();
    res.json({ message: review.status === "hidden" ? "Review hidden pending moderation" : "Review reported" });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

const moderateReview = async (req, res) => {
  try { const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!review) return res.status(404).json({ message: "Review not found" }); res.json(review); }
  catch (error) { res.status(400).json({ message: error.message }); }
};

module.exports = { getReviews, getEligibleReviews, createReview, reportReview, moderateReview };