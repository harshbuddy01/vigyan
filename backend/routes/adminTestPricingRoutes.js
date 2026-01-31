import express from "express";
import { requireAdminAuth } from "../middlewares/adminAuth.js";
import Test from "../models/Test.js";

const router = express.Router();

// List tests with pricing (admin only)
router.get("/tests", requireAdminAuth, async (req, res) => {
  try {
    const tests = await Test.find({}, "testId name price").lean();
    res.json({ success: true, tests });
  } catch (error) {
    console.error("Admin get tests error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Secure price update (admin only)
router.patch("/tests/:testId/price", requireAdminAuth, async (req, res) => {
  try {
    const { testId } = req.params;
    const { price } = req.body;

    if (typeof price !== "number" || !Number.isFinite(price)) {
      return res.status(400).json({ success: false, message: "Valid numeric price is required" });
    }

    // Accept only sensible prices in rupees
    if (price < 1 || price > 100000) {
      return res.status(400).json({ success: false, message: "Price must be between 1 and 100000 rupees" });
    }

    const test = await Test.findOne({ testId });
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    const oldPrice = test.price ?? null;
    test.price = price;
    await test.save();

    console.log("🔐 Price updated by admin", {
      adminId: req.admin?.id,
      testId,
      oldPrice,
      newPrice: price,
      ip: req.ip,
      at: new Date().toISOString(),
    });

    res.json({ success: true, message: "Price updated", testId, oldPrice, newPrice: price });
  } catch (error) {
    console.error("Admin update price error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
