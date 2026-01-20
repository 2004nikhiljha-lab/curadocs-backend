// controllers/doctorController.js
const Doctor = require('../Models/Doctor');
const Patient = require('../Models/Patient');

// @desc    Get doctor dashboard data
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor only)
exports.getDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id)
      .populate('patients', 'fullName email')
      .select('-password');

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found'
      });
    }

    // Get upcoming appointments
    const upcomingAppointments = doctor.appointments
      .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    // Calculate stats
    const stats = {
      totalPatients: doctor.patients.length,
      upcomingAppointments: upcomingAppointments.length,
      totalAppointments: doctor.appointments.length,
      completedAppointments: doctor.appointments.filter(apt => apt.status === 'completed').length
    };

    res.status(200).json({
      status: 'success',
      data: {
        doctor: {
          id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          specialization: doctor.specialization,
          experience: doctor.experience,
          licenseNumber: doctor.licenseNumber
        },
        stats,
        upcomingAppointments,
        recentPatients: doctor.patients.slice(0, 5)
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

// @desc    Get all patients
// @route   GET /api/doctor/patients
// @access  Private (Doctor only)
exports.getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id)
      .populate('patients', 'fullName email bloodGroup healthStats');

    res.status(200).json({
      status: 'success',
      data: {
        patients: doctor.patients
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching patients'
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor only)
exports.getAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id);

    const appointments = doctor.appointments.sort((a, b) => 
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

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private (Doctor only)
exports.updateProfile = async (req, res) => {
  try {
    const { specialization, licenseNumber, experience, availability } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      {
        specialization,
        licenseNumber,
        experience,
        availability
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { doctor }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating profile'
    });
  }
};