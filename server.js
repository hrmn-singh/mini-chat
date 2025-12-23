const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());

// ================== MONGODB CONNECT ==================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// ================== USER SCHEMA ==================
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// =================================================
// 🔹 🔹 🔹 REGISTER ROUTE (THIS IS /register)
// =================================================
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check all fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // 5. Success
    res.json({
      message: "User registered successfully",
      userId: newUser._id,
      username: newUser.username
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =================================================
// 🔹 🔹 🔹 LOGIN ROUTE (THIS IS /login)
// =================================================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 4. Success
    res.json({
      message: "Login successful",
      userId: user._id,
      username: user.username,
      email: user.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

