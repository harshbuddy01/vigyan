import express from "express";
import { 
  adminLogin, 
  uploadQuestion, 
  deleteQuestion, 
  getResults,
  getAllQuestions,
  getAllStudents,
  getFeedbacks
} from "../controllers/adminController.js";

const router = express.Router();

// Admin authentication
router.post("/admin-login", adminLogin);

// Question management
router.post("/upload-question", uploadQuestion);
router.delete("/admin/delete-question/:id", deleteQuestion);
router.get("/admin/all-questions", getAllQuestions);

// Student management
router.get("/admin/all-students", getAllStudents);

// Results and feedback
router.get("/admin/results", getResults);
router.get("/admin/feedbacks", getFeedbacks);

export default router;