import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

const populateCart = (query) =>
  query.populate({
    path: "items.product",
    populate: { path: "vendorId", select: "shopName" },
  });

// @desc    Get user cart
// @route   GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await populateCart(Cart.findOne({ userId: req.user._id }));

  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [] });
  }

  res.json({ success: true, data: cart });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Insufficient stock");
  }

  let cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    cart = await Cart.create({ userId: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  cart = await populateCart(Cart.findById(cart._id));

  res.json({ success: true, data: cart });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }

  const product = await Product.findById(item.product);
  if (quantity > product.stock) {
    res.status(400);
    throw new Error("Insufficient stock");
  }

  item.quantity = quantity;
  await cart.save();

  const updated = await populateCart(Cart.findById(cart._id));
  res.json({ success: true, data: updated });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.id
  );
  await cart.save();

  const updated = await populateCart(Cart.findById(cart._id));
  res.json({ success: true, data: updated });
});

// @desc    Clear cart
// @route   DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { items: [] },
    { upsert: true }
  );
  res.json({ success: true, message: "Cart cleared" });
});
