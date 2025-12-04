// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail"); // 👈 make sure this line is here

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User
exports.registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  // Validation: Check for missing fields
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10); // ❌ not needed, model hashes it

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit

    // Create the user
    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
      isVerified: false,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 10 * 60 * 1000, // 10 mins from now
    });

    // 👇👇 ADD THIS PART: call sendEmail + optional devOtp
    console.log("About to send OTP email to:", user.email, "OTP:", otp);
    await sendEmail({
      to: user.email,
      subject: "Verify your email - Finance Tracker",
      text: `Hi ${user.fullName},\n\nYour OTP for email verification is: ${otp}\nIt will expire in 10 minutes.\n\nIf you didn't sign up, you can ignore this email.`,
    });
    console.log("sendEmail() finished");

    const responseData = {
      success: true,
      message: "User registered. OTP sent to email for verification.",
    };

    // DEV ONLY: return OTP in response so you can test
    if (process.env.NODE_ENV !== "production") {
      responseData.devOtp = otp;
    }

    return res.status(201).json(responseData);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
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
