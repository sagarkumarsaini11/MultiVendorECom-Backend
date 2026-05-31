import express from "express";
import {
  getAllUsers,
  getAllVendors,
  approveVendor,
  blockVendor,
  getAllProducts,
  getAllOrders,
  getAdminStats,
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/vendors", getAllVendors);
router.put("/vendor/approve/:id", approveVendor);
router.put("/vendor/block/:id", blockVendor);
router.get("/products", getAllProducts);
router.get("/orders", getAllOrders);

export default router;
