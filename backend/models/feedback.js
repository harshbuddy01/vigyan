import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true 
  },
  
  rollNumber: { 
    type: String, 
    required: true
  },
  
  testId: {
    type: String,
    required: true
  },
  
  ratings: {
    login: { type: Number, min: 0, max: 5, default: 0 },
    interface: { type: Number, min: 0, max: 5, default: 0 },
    quality: { type: Number, min: 0, max: 5, default: 0 },
    server: { type: Number, min: 0, max: 5, default: 0 }
  },
  
  comment: {
    type: String,
    default: ""
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;