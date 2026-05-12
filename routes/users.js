const express = require('express');
const bcrypt = require('bcryptjs');
const { dbAll, dbGet, dbRun } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

const grandAdminOnly = (req, res, next) => {
  if (req.user.role !== 'grand_admin')
    return res.status(403).json({ error: 'Access denied. Grand Admin only.' });
  next();
};

router.use(authMiddleware, grandAdminOnly);

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await dbAll('SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name || !role)
      return res.status(400).json({ error: 'All fields are required' });

    const validRoles = ['grand_admin', 'front_office_admin', 'front_office_employee', 'sales_admin', 'sales_employee', 'manager'];
    if (!validRoles.includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    const existing = await dbGet('SELECT id FROM users WHERE username = ?', [username]);
    if (existing)
      return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await dbRun(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, role]
    );

    res.json({ message: 'User created successfully', userId: result.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id)
      return res.status(400).json({ error: 'Cannot delete your own account' });

    await dbRun('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;