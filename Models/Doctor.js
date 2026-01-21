// Models/Doctor.js
import mongoose from 'mongoose';
import User from './User.js';

const doctorSchema = new mongoose.Schema({
  specialization: {
    type: String,
    default: 'General Physician'
  },
  licenseNumber: {
    type: String,
    sparse: true
  },
  experience: {
    type: Number,
    default: 0
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  appointments: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    patientName: String,
    date: Date,
    time: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    reason: String
  }],
  availability: {
    days: [String],
    startTime: String,
    endTime: String
  }
});

const Doctor = User.discriminator('doctor', doctorSchema);

export default Doctor;
