const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Profile fields for users
  address: { type: String, default: '' },
  profile_picture:{type:String, required: true},
  phone: { type: String, default: '' },
});

module.exports = mongoose.model('User', UserSchema);