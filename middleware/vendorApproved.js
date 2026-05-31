import Vendor from "../models/Vendor.js";
import asyncHandler from "../utils/asyncHandler.js";

/** Ensures vendor account is approved before product/order operations */
export const vendorApproved = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor profile not found");
  }

  if (vendor.status !== "approved") {
    res.status(403);
    throw new Error(
      vendor.status === "pending"
        ? "Vendor account pending admin approval"
        : "Vendor account is blocked"
    );
  }

  req.vendor = vendor;
  next();
});
