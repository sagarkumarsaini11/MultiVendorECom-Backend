import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
} from "../controllers/product.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { vendorApproved } from "../middleware/vendorApproved.js";
import { validate } from "../middleware/validate.js";
import { productValidation } from "../utils/validators.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/vendor/my-products", protect, authorize("vendor"), vendorApproved, getVendorProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  authorize("vendor"),
  vendorApproved,
  upload.single("image"),
  productValidation,
  validate,
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("vendor", "admin"),
  (req, res, next) => {
    if (req.user.role === "vendor") return vendorApproved(req, res, next);
    next();
  },
  upload.single("image"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  authorize("vendor", "admin"),
  (req, res, next) => {
    if (req.user.role === "vendor") return vendorApproved(req, res, next);
    next();
  },
  deleteProduct
);

export default router;
