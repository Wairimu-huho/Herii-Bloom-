require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const [, , name, email, password] = process.argv;

if (!name || !email || !password || password.length < 6) {
  console.error("Usage: node scripts/createAdmin.js \"Admin Name\" admin@example.com \"password-at-least-6-chars\"");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { name, email: email.toLowerCase().trim(), password: hashedPassword, role: "admin" },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
    console.log(`Admin user ready: ${user.email}`);
  } catch (error) {
    console.error(`Could not create admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
