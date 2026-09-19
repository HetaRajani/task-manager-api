const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validateAuth } = require('../middleware/validate');

const router = express.Router();

// ==========================================
// VIVA TOPIC: Why bcrypt is used for password hashing
// ==========================================
// 1. One-Way Hashing: Passwords must never be stored as plain text. bcrypt transforms
//    passwords into irreversible cryptographic hashes.
// 2. Salt Generation: bcrypt creates a unique, cryptographically secure random salt for
//    each password. This defeats rainbow table attacks (precomputed hash lookups) and ensures
//    identical passwords produce different hashes.
// 3. Adaptive Work Factor: 10 salt rounds make hashing computationally expensive and slow
//    by design, rendering offline brute-force and dictionary attacks impractical for attackers.

// POST /register - register a new user
router.post('/register', validateAuth, async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const { password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      _id: user._id,
      email: user.email,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }
});

// POST /login - authenticate an existing user
router.post('/login', validateAuth, async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const { password } = req.body;

    const user = await User.findOne({ email });
    // Same 401 error message for wrong email or wrong password prevents user enumeration
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

// GET /me - get authenticated user's profile
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
