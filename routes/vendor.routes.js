import express from "express";
import { getVendorOrders, getVendorStats } from "../controllers/vendor.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { vendorApproved } from "../middleware/vendorApproved.js";

const router = express.Router();

router.use(protect, authorize("vendor"), vendorApproved);

router.get("/orders", getVendorOrders);
router.get("/stats", getVendorStats);

export default router;
