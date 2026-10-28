const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const ALLOWED_STATUSES = ['To Do', 'Done'];
const PAGE_SIZE = 20;

router.get('/api/tasks', authenticate, async (req, res) => {
  const { projectId, page = 1 } = req.query;
  const offset = (page - 1) * PAGE_SIZE;

  try {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (projectId) {
      params.push(projectId);
      sql += ` AND project_id = $${params.length}`;
    }

    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      sql += ` AND assigned_to = $${params.length}`;
    }

    params.push(PAGE_SIZE);
    params.push(offset);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await db.query(sql, params);
    return res.status(200).json({ tasks: result.rows, page });
  } catch (err) {
    console.error('GET /api/tasks failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const taskId = Number(req.params.id);
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = rows[0];
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.assigned_to === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No permission to edit this task' });
    }

    if (!isAdmin && task.status === 'Done' && status === 'To Do') {
      return res.status(409).json({ message: 'Cannot reopen a finished task' });
    }

    await db.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, taskId]
    );

    await db.query(
      'INSERT INTO audit_log (task_id, user_id, action) VALUES ($1, $2, $3)',
      [taskId, req.user.id, `status:${status}`]
    );

    return res.status(200).json({ task: { ...task, status } });
  } catch (err) {
    console.error('PATCH /api/tasks/:id/status failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/api/tasks/:id', authenticate, async (req, res) => {
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  return res.status(204).end();
});

module.exports = router;