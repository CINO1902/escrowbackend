const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserFromTokenUtils } = require('../utils/auth');
const User = require('../models/User');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function getUserFromToken(token) {
  const user = await getUserFromTokenUtils(token);
  if (!user) throw new Error('Unauthorized Access');
  return user;
}

async function loginService(email, password) {

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await comparePassword(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  return user;
}

module.exports = { hashPassword, comparePassword, signToken, getUserFromToken, loginService };