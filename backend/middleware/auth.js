import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  // console.log('in auth');
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded; // Contains { id: userId, email: userEmail }
    next();
  } catch (err) {
    // console.log('err in auth');

    return res.status(401).json({ error: 'Invalid or expired token. Please login again' });
  }
};
