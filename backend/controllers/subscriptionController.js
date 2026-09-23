const Subscription = require("../models/Subscription");

// @route POST /api/subscriptions  (logged-in user subscribes to a box)
const createSubscription = async (req, res) => {
  try {
    const { boxId, deliveryAddress } = req.body;

    const subscription = await Subscription.create({
      user: req.user._id,
      box: boxId,
      deliveryAddress,
      status: "pending", // flips to "active" once payment is wired up
    });

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/subscriptions/me  (a subscriber checking their own status)
const getMySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id }).populate("box");
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/subscriptions  (admin only — this IS your tracking sheet)
const getAllSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find()
      .populate("user", "name email phone address")
      .populate("box", "name price")
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/subscriptions/:id  (admin updates status, e.g. mark as paid/active)
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
