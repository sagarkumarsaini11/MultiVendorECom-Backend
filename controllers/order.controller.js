import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Place order (dummy checkout)
// @route   POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  let totalAmount = 0;
  const orderProducts = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product) continue;

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const lineTotal = product.price * item.quantity;
    totalAmount += lineTotal;

    orderProducts.push({
      product: product._id,
      vendorId: product.vendorId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    });

    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    userId: req.user._id,
    products: orderProducts,
    totalAmount,
    shippingAddress: req.body.shippingAddress || {},
    status: "confirmed",
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, data: orders });
});
