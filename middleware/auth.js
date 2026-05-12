const jwt = require('jsonwebtoken'); // This creates JWT tokens for user authentication and authorization. It allows us to securely transmit information between parties as a JSON object, which can be verified and trusted because it is digitally signed.

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Old admin middleware - kept for backwards compatibility
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// New admin middleware - allows all admin roles
const isAdmin = (req, res, next) => {
  const adminRoles = ['admin', 'grand_admin', 'front_office_admin', 'sales_admin'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, isAdmin };
