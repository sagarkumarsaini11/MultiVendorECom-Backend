import express from "express";
import { createOrder, getMyOrders } from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(protect, authorize("user"));

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);

export default router;
