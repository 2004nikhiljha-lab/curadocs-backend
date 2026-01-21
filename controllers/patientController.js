// controllers/patientController.js
import Patient from '../Models/Patient.js';

// @desc    Get patient dashboard data
// @route   GET /api/patient/dashboard
// @access  Private (Patient only)
export const getDashboard = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('-password');

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Get upcoming appointments
    const upcomingAppointments = patient.appointments
      .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    // Calculate stats
    const stats = {
      upcomingAppointments: upcomingAppointments.length,
      totalAppointments: patient.appointments.length,
      activeMedicalConditions: patient.medicalHistory.filter(h => h.status === 'active').length,
      currentMedications: patient.currentMedications.length
    };

    res.status(200).json({
      status: 'success',
      data: {
        patient: {
          id: patient._id,
          fullName: patient.fullName,
          email: patient.email,
          bloodGroup: patient.bloodGroup,
          dateOfBirth: patient.dateOfBirth,
          healthStats: patient.healthStats
        },
        stats,
        upcomingAppointments,
        recentMedicalHistory: patient.medicalHistory.slice(0, 3)
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching dashboard data'
    });
  }
};

// @desc    Get medical history
// @route   GET /api/patient/medical-history
// @access  Private (Patient only)
export const getMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        currentMedications: patient.currentMedications
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching medical history'
    });
  }
};

// @desc    Get appointments
// @route   GET /api/patient/appointments
// @access  Private (Patient only)
export const getAppointments = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);

    const appointments = patient.appointments.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    res.status(200).json({
      status: 'success',
      data: {
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching appointments'
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private (Patient only)
export const updateProfile = async (req, res) => {
  try {
    const { dateOfBirth, bloodGroup, healthStats, allergies } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.user.id,
      {
        dateOfBirth,
        bloodGroup,
        healthStats,
        allergies
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { patient }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Get health stats
// @route   GET /api/patient/health-stats
// @access  Private (Patient only)
export const getHealthStats = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        healthStats: patient.healthStats,
        bloodGroup: patient.bloodGroup,
        dateOfBirth: patient.dateOfBirth
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching health stats'
    });
  }
};
