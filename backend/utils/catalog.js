const Category = require("../models/Category");

const LEGACY_CATEGORIES = {
  pads: { key: "pads", name: "Pads", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false, atLeastOneGroup: "period-products" },
  tampons: { key: "tampons", name: "Tampons", minSelections: 0, maxSelections: 1, allowRepeat: false, optionalExtra: false, atLeastOneGroup: "period-products" },
  chocolate: { key: "chocolate", name: "Chocolate", minSelections: 1, maxSelections: 1, allowRepeat: false, optionalExtra: false },
  tea: { key: "tea", name: "Tea", minSelections: 5, maxSelections: 5, allowRepeat: true, optionalExtra: false },
  candle: { key: "candle", name: "Candle", minSelections: 1, maxSelections: 1, allowRepeat: false, optionalExtra: false },
  addon: { key: "addon", name: "Add-ons", minSelections: 0, maxSelections: null, allowRepeat: false, optionalExtra: true },
};

async function resolveBoxCategories(box) {
  if (box.categoryIds?.length) {
    const categories = await Category.find({ _id: { $in: box.categoryIds }, active: true }).sort({ name: 1 }).lean();
    const automatic = await Category.find({ active: true, includedAutomatically: true, _id: { $nin: categories.map((category) => category._id) } }).lean();
    if (categories.length || automatic.length) return [...automatic, ...categories];
  }
  const keys = box.categories?.length ? box.categories : Object.keys(LEGACY_CATEGORIES);
  const legacy = keys.map((key) => LEGACY_CATEGORIES[key] || {
    key,
    name: key.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    minSelections: 0,
    maxSelections: 1,
    allowRepeat: false,
    optionalExtra: true,
  });
  const automatic = await Category.find({ active: true, includedAutomatically: true }).lean();
  return [...automatic, ...legacy];
}

module.exports = { LEGACY_CATEGORIES, resolveBoxCategories };
