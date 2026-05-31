import Product from "../models/Product.js";
import Vendor from "../models/Vendor.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Get all products (public, with search/filter/pagination)
// @route   GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // Only show products from approved vendors for public listing
  const approvedVendors = await Vendor.find({ status: "approved" }).select("_id");
  const approvedIds = approvedVendors.map((v) => v._id);
  filter.vendorId = { $in: approvedIds };

  if (req.query.vendorId) {
    filter.vendorId = req.query.vendorId;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate({ path: "vendorId", select: "shopName status" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate({
    path: "vendorId",
    select: "shopName status",
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});

// @desc    Create product (vendor)
// @route   POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const image =
    req.file?.path ||
    req.file?.secure_url ||
    req.body.image ||
    "https://placehold.co/400x400?text=Product";

  const product = await Product.create({
    vendorId: req.vendor._id,
    name,
    description,
    price: Number(price),
    stock: Number(stock),
    category,
    image,
  });

  res.status(201).json({ success: true, data: product });
});

// @desc    Update product (vendor own / admin all)
// @route   PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (
    req.user.role === "vendor" &&
    product.vendorId.toString() !== req.vendor._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to update this product");
  }

  const updates = { ...req.body };
  if (req.file?.path) updates.image = req.file.path;
  if (updates.price) updates.price = Number(updates.price);
  if (updates.stock) updates.stock = Number(updates.stock);

  product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (
    req.user.role === "vendor" &&
    product.vendorId.toString() !== req.vendor._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this product");
  }

  await product.deleteOne();
  res.json({ success: true, message: "Product removed" });
});

// @desc    Get vendor's own products
// @route   GET /api/products/vendor/my-products
export const getVendorProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendorId: req.vendor._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, data: products });
});
