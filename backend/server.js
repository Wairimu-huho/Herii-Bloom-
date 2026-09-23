require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const boxRoutes = require("./routes/boxRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) => res.send("Heri Bloom API is running"));

app.use("/api/auth", authRoutes);
app.use("/api/boxes", boxRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
