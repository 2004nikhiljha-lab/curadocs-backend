// Models/Patient.js
const mongoose = require('mongoose');
const User = require('./User');

const patientSchema = new mongoose.Schema({
  dateOfBirth: {
    type: Date
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active'
    }
  }],
  appointments: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    doctorName: String,
    date: Date,
    time: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    reason: String
  }],
  healthStats: {
    height: Number,
    weight: Number,
    lastCheckup: Date
  },
  allergies: [String],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String
  }]
});

const Patient = User.discriminator('patient', patientSchema);

module.exports = Patient;