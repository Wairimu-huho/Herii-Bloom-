// Defines how many items a subscriber must choose per category.
// min/max bound how many total selections a category needs (max: null = no upper limit).
// allowRepeat controls whether the same product can be chosen more than once (only tea allows this).
const SELECTION_RULES = {
  pads: { min: 0, max: 1, allowRepeat: false }, // optional brand pick, no quantity choice
  tampons: { min: 0, max: 1, allowRepeat: false }, // optional brand pick, no quantity choice
  chocolate: { min: 1, max: 1, allowRepeat: false },
  tea: { min: 5, max: 5, allowRepeat: true },
  candle: { min: 1, max: 1, allowRepeat: false },
  addon: { min: 0, max: null, allowRepeat: false }, // e.g. heat pad, hot water bottle, menstrual cup
};

// At least one category in this group must be chosen, combined (pads alone, tampons alone, or both).
const REQUIRE_AT_LEAST_ONE_OF = ["pads", "tampons"];

const CATEGORIES = Object.keys(SELECTION_RULES);

module.exports = { SELECTION_RULES, REQUIRE_AT_LEAST_ONE_OF, CATEGORIES };