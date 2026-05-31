import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("-password")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

// @desc    Get all vendors
// @route   GET /api/admin/vendors
export const getAllVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: vendors });
});

// @desc    Approve vendor
// @route   PUT /api/admin/vendor/approve/:id
export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  ).populate("userId", "name email");

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  res.json({ success: true, data: vendor, message: "Vendor approved" });
});

// @desc    Block vendor
// @route   PUT /api/admin/vendor/block/:id
export const blockVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status: "blocked" },
    { new: true }
  ).populate("userId", "name email");

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  res.json({ success: true, data: vendor, message: "Vendor blocked" });
});

// @desc    Get all products (admin)
// @route   GET /api/admin/products
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find()
    .populate({ path: "vendorId", populate: { path: "userId", select: "name email" } })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: products });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// @desc    Admin dashboard statistics
// @route   GET /api/admin/stats
export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalVendors, totalProducts, totalOrders, revenueResult] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      Vendor.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
      pendingVendors: await Vendor.countDocuments({ status: "pending" }),
    },
  });
});
