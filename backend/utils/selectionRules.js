// Defines how many items a subscriber must choose per category, and whether
// picking the same product more than once is allowed (only teas allow repeats).
const SELECTION_RULES = {
    pads: { exact: 1, allowRepeat: false },
    tampons: { exact: 1, allowRepeat: false },
    chocolate: { exact: 1, allowRepeat: false },
    tea: { exact: 5, allowRepeat: true },
    candle: { exact: 1, allowRepeat: false },
  };
  
  const CATEGORIES = Object.keys(SELECTION_RULES);
  
  module.exports = { SELECTION_RULES, CATEGORIES };