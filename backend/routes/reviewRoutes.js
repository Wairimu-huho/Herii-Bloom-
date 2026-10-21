const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getReviews, getEligibleReviews, createReview, reportReview, moderateReview } = require("../controllers/reviewController");

router.get("/", getReviews);
router.get("/eligible", protect, getEligibleReviews);
router.post("/", protect, createReview);
router.post("/:id/report", protect, reportReview);
router.patch("/:id/moderate", protect, adminOnly, moderateReview);

module.exports = router;
