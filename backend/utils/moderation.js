const Filter = require("bad-words");
const filter = new Filter();

// How many reports before something auto-hides pending admin review.
const REPORT_THRESHOLD = 3;

const checkContent = (text) => {
  const flaggedByFilter = filter.isProfane(text);
  return { flaggedByFilter };
};

module.exports = { checkContent, REPORT_THRESHOLD };
