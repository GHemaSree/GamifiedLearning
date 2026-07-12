// // src/middleware/admin.middleware.js
// const adminOnly = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//     return next();
//   }
//   return res.status(403).json({ message: 'Admin access required' });
// };

// module.exports = { adminOnly };
const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = admin;