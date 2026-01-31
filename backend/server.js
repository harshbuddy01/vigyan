import express from "express";
import cors from "cors";
// ... other imports ...
import adminTestPricingRoutes from "./routes/adminTestPricingRoutes.js";

const app = express();

// existing middleware setup...

// Admin routes
app.use("/api/admin/tests", adminAuthMiddleware, adminTestPricingRoutes);

// ... rest of server setup and exports ...
