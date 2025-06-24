const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  otp: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  date_created: { type: Date, required: true },
  date_expired: { type: Date, required: true },
});

module.exports = mongoose.model('Otp', OtpSchema);