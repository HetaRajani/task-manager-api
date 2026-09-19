require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ---- Request logging middleware (applied globally) ----
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ---- Content-Type validation middleware for POST/PUT ----
function requireJsonContentType(req, res, next) {
  if (['POST', 'PUT'].includes(req.method)) {
    if (req.headers['content-type'] !== 'application/json') {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
}
app.use(requireJsonContentType);

const Task = require('./models/Task');

// ---- Route-specific middleware: validate Mongo ObjectId ----
function validateIdParam(req, res, next) {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid task id format' });
  }
  req.taskId = id;
  next();
}

// ---- CRUD Routes using Mongoose ----

// GET /tasks - read all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - read a single task
app.get('/tasks/:id', validateIdParam, async (req, res, next) => {
  try {
    const task = await Task.findById(req.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - create a task
app.post('/tasks', async (req, res, next) => {
  try {
    const created = await Task.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - update a task
app.put('/tasks/:id', validateIdParam, async (req, res, next) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.taskId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - delete a task
app.delete('/tasks/:id', validateIdParam, async (req, res, next) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.taskId);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ message: `Task ${req.taskId} deleted` });
  } catch (err) {
    next(err);
  }
});

// ---- 404 handler for undefined routes ----
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// ---- Global error handling middleware (must be last) ----
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map((key) => ({
      field: err.errors[key].path || key,
      message: err.errors[key].message,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid task id format' });
  }

  console.error(err.stack || err);
  res.status(500).json({ error: 'Something went wrong' });
});

// ---- Connect to MongoDB and start server only after successful connection ----
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set in environment');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

module.exports = app;
