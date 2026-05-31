import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get orders containing vendor's products
// @route   GET /api/vendor/orders
export const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    "products.vendorId": req.vendor._id,
  })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  const vendorOrders = orders.map((order) => {
    const vendorProducts = order.products.filter(
      (p) => p.vendorId.toString() === req.vendor._id.toString()
    );
    const vendorTotal = vendorProducts.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    return {
      _id: order._id,
      user: order.userId,
      products: vendorProducts,
      vendorTotal,
      status: order.status,
      createdAt: order.createdAt,
    };
  });

  res.json({ success: true, data: vendorOrders });
});

// @desc    Vendor dashboard statistics
// @route   GET /api/vendor/stats
export const getVendorStats = asyncHandler(async (req, res) => {
  const vendorId = req.vendor._id;

  const totalProducts = await Product.countDocuments({ vendorId });

  const orders = await Order.find({ "products.vendorId": vendorId });

  let totalOrders = 0;
  let totalRevenue = 0;

  orders.forEach((order) => {
    const vendorItems = order.products.filter(
      (p) => p.vendorId.toString() === vendorId.toString()
    );
    if (vendorItems.length > 0) {
      totalOrders += 1;
      totalRevenue += vendorItems.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );
    }
  });

  res.json({
    success: true,
    data: {
      totalProducts,
      totalOrders,
      totalRevenue,
    },
  });
});
