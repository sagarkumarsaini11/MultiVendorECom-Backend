import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@shop.com";
    const exists = await User.findOne({ email });

    if (exists) {
      console.log("Admin user already exists:", email);
      process.exit(0);
    }

    await User.create({
      name: process.env.ADMIN_NAME || "Super Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "Admin@123456",
      role: "admin",
    });

    console.log("Admin user created successfully:", email);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
