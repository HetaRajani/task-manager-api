const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_PRIORITIES = ['low', 'medium', 'high'];

function validateAuth(req, res, next) {
  const details = [];
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    details.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    details.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (details.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  next();
}

function validateTask(req, res, next) {
  const details = [];
  const { title, priority } = req.body || {};

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      details.push({ field: 'title', message: 'Title is required and cannot be empty' });
    }
  } else if (req.method === 'PUT') {
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      details.push({ field: 'title', message: 'Title cannot be empty' });
    }
  }

  if (priority !== undefined && !ALLOWED_PRIORITIES.includes(priority)) {
    details.push({
      field: 'priority',
      message: 'Priority must be low, medium, or high',
    });
  }

  if (details.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  next();
}

module.exports = {
  validateAuth,
  validateTask,
};
