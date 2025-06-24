const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function getUserFromTokenUtils(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch (err) {
    return null;
  }
}

module.exports = { getUserFromTokenUtils };