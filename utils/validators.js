import { body } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const productValidation = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  body("stock").isInt({ min: 0 }).withMessage("Valid stock is required"),
];

export const cartValidation = [
  body("productId").notEmpty().withMessage("Product ID is required"),
  body("quantity").optional().isInt({ min: 1 }),
];
