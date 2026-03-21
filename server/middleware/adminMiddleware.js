import dotenv from 'dotenv';
dotenv.config();

export const isAdmin = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return res.status(500).json({ message: 'Admin email not configured' });
  }

  if (!req.user || req.user.email !== adminEmail) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};
