// Routes/doctorRoutes.js
import express from 'express';
import {
  getDashboard,
  getPatients,
  getAppointments,
  updateProfile
} from '../controllers/doctorController.js';
import { protect } from '../Middleware/authMiddleware.js';
import { authorize } from '../Middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected and require doctor role
router.use(protect);
router.use(authorize('doctor'));

router.get('/dashboard', getDashboard);
router.get('/patients', getPatients);
router.get('/appointments', getAppointments);
router.put('/profile', updateProfile);

export default router;
