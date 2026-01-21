// Routes/patientRoutes.js
import express from 'express';
import {
  getDashboard,
  getMedicalHistory,
  getAppointments,
  updateProfile,
  getHealthStats
} from '../controllers/patientController.js';
import { protect } from '../Middleware/authMiddleware.js';
import { authorize } from '../Middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected and require patient role
router.use(protect);
router.use(authorize('patient'));

router.get('/dashboard', getDashboard);
router.get('/medical-history', getMedicalHistory);
router.get('/appointments', getAppointments);
router.get('/health-stats', getHealthStats);
router.put('/profile', updateProfile);

export default router;
