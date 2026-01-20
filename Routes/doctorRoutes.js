// Routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getPatients,
  getAppointments,
  updateProfile
} = require('../controllers/doctorController');
const { protect } = require('../Middleware/authMiddleware');
const { authorize } = require('../Middleware/roleMiddleware');

// All routes are protected and require doctor role
router.use(protect);
router.use(authorize('doctor'));

router.get('/dashboard', getDashboard);
router.get('/patients', getPatients);
router.get('/appointments', getAppointments);
router.put('/profile', updateProfile);

module.exports = router;