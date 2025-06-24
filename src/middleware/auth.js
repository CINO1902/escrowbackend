const { getUserFromTokenUtils } = require('../utils/auth');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token provided' });

  const token = authHeader.split(' ')[1];
  const user = await getUserFromTokenUtils(token);
  if (!user) return res.status(401).json({ msg: 'User not found' });

  req.user = user;
  next();
};