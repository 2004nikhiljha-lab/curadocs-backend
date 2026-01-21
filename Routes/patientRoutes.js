// Routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getMedicalHistory,
  getAppointments,
  updateProfile,
  getHealthStats
} = require('../controllers/patientController');
const { protect } = require('../Middleware/authMiddleware');
const { authorize } = require('../Middleware/roleMiddleware');

// All routes are protected and require patient role
router.use(protect);
router.use(authorize('patient'));

router.get('/dashboard', getDashboard);
router.get('/medical-history', getMedicalHistory);
router.get('/appointments', getAppointments);
router.get('/health-stats', getHealthStats);
router.put('/profile', updateProfile);

export default router;
