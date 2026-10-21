const Product = require("../models/Product");
const Category = require("../models/Category");
const { DEFAULT_CATEGORIES } = require("../controllers/catalogController");

async function syncCatalog() {
  await Product.updateMany(
    { $or: [{ inStock: { $exists: false } }, { archived: { $exists: false } }, { hasOptions: { $exists: false } }] },
    { $set: { inStock: true, archived: false, hasOptions: true } }
  );
  await Promise.all(DEFAULT_CATEGORIES.map((category) => Category.updateOne({ key: category.key }, { $setOnInsert: category }, { upsert: true })));
  console.log("Catalog synchronized");
}

module.exports = syncCatalog;
