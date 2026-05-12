require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');
const preshiftRoutes = require('./routes/preshift');
const userRoutes = require('./routes/users');
const modRoutes = require('./routes/mod');
const groupResumeRoutes = require('./routes/groupresumes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger - see all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - MORE SPECIFIC ROUTES MUST COME FIRST!
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin/users', userRoutes); // THIS MUST BE BEFORE /api/admin
app.use('/api/admin', adminRoutes);
app.use('/api/preshift', preshiftRoutes);
app.use('/api/mod', modRoutes);
app.use('/api/groupresumes', groupResumeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
