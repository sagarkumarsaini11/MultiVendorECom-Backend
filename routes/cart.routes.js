import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { cartValidation } from "../utils/validators.js";

const router = express.Router();

router.use(protect, authorize("user"));

router.get("/", getCart);
router.post("/add", cartValidation, validate, addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/:id", removeFromCart);

export default router;
