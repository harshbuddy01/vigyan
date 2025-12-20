// backend/models/payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
  // Adding the field for your new automatic 8-digit token
  examToken: { 
    type: String, 
    index: true 
  }, 
  email: { 
    type: String, 
    index: true 
  },      
  isUsed: { type: Boolean, default: false },
  testId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// CHANGE THIS: Remove 'default' and use a named export
export const Payment = mongoose.model("Payment", paymentSchema);