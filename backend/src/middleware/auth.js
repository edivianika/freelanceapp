const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../../lib/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, created_at, updated_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireMarketer = (req, res, next) => {
  if (req.user.role !== 'marketer') {
    return res.status(403).json({ error: 'Marketer access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireMarketer
};
