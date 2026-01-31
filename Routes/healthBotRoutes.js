// Routes/healthBotRoutes.js
import express from 'express';
import * as healthBotController from '../controllers/healthBotController.js';
import { protect } from '../Middleware/authMiddleware.js';  // ← Changed from authMiddleware to protect

const router = express.Router();

// All routes require authentication
router.use(protect);  // ← Changed from authMiddleware to protect

// Health bot endpoints
router.post('/message', healthBotController.sendMessage);
router.get('/history', healthBotController.getChatHistory);
router.delete('/history', healthBotController.clearChatHistory);
router.get('/stats', healthBotController.getChatStats);

export default router;