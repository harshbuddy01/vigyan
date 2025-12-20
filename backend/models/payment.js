import express from "express";
// Both names here must match the 'export const' names in the controller
import { checkout, paymentVerification } from "../controllers/paymentController.js";

const router = express.Router();

router.route("/checkout").post(checkout);
router.route("/paymentverification").post(paymentVerification);

export default router;