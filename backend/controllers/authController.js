// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User
exports.registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });

    // ❌ CASE 1: VERIFIED USER → BLOCK
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 🗑️ CASE 2: UNVERIFIED USER → DELETE OLD RECORD
    if (existingUser && !existingUser.isVerified) {
      await User.deleteOne({ email });
    }

    // 🔐 Generate NEW OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 📧 Send OTP FIRST
    const emailSent = await sendEmail({
      to: email,
      subject: "Verify your email - Finance Tracker",
      text: `Hi ${fullName},\n\nYour OTP is: ${otp}\nIt expires in 10 minutes.`,
    });

    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Please try again." });
    }

    // ✅ Create fresh user
    await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
      isVerified: false,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 10 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email for verification.",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Block login if email not verified
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });
    }

    res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error looging in user", error: err.message });
  }
};

// Get logged-in user info
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

// Verify Email using OTP
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified", success: false });
    }

    if (!user.verifyOtp || !user.verifyOtpExpireAt) {
      return res
        .status(400)
        .json({ message: "OTP not generated", success: false });
    }

    // Check expiry
    if (user.verifyOtpExpireAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP expired, please request a new one" });
    }

    // Compare OTP
    if (user.verifyOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    // Mark as verified
    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    // Issue token on successful verification
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error verifying email", error: err.message });
  }
};
