const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Automatically delete document after 5 minutes (300 seconds)
  },
});

const OtpModel = mongoose.model('Otp', otpSchema);

module.exports = OtpModel;
