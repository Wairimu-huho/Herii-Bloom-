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
    if (categories.length) return categories;
  }
  const keys = box.categories?.length ? box.categories : Object.keys(LEGACY_CATEGORIES);
  return keys.map((key) => LEGACY_CATEGORIES[key] || {
    key,
    name: key.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    minSelections: 0,
    maxSelections: 1,
    allowRepeat: false,
    optionalExtra: true,
  });
}

module.exports = { LEGACY_CATEGORIES, resolveBoxCategories };
