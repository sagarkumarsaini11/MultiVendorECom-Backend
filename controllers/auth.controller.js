import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import { generateToken } from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Register user or vendor
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, shopName } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const userRole = role === "vendor" ? "vendor" : "user";

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  });

  if (userRole === "vendor") {
    if (!shopName) {
      res.status(400);
      throw new Error("Shop name is required for vendor registration");
    }
    await Vendor.create({
      userId: user._id,
      shopName,
      status: "pending",
    });
  }

  res.status(201).json({
    success: true,
    message: userRole === "vendor"
      ? "Vendor registered. Awaiting admin approval."
      : "Registration successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login user / vendor / admin
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  let vendor = null;
  if (user.role === "vendor") {
    vendor = await Vendor.findOne({ userId: user._id });
    if (vendor?.status === "blocked") {
      res.status(403);
      throw new Error("Your vendor account has been blocked");
    }
  }

  res.json({
    success: true,
    message: "Login successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendor,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  let vendor = null;
  if (req.user.role === "vendor") {
    vendor = await Vendor.findOne({ userId: req.user._id });
  }

  res.json({
    success: true,
    data: { ...req.user.toObject(), vendor },
  });
});
