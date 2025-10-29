import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, teacher_id } = req.query;
    let query = `
      SELECT c.*,
        t.first_name || ' ' || t.last_name as teacher_name,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'enrolled') as enrolled_count
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (teacher_id) {
      query += ' AND c.teacher_id = ?';
      params.push(teacher_id);
    }

    query += ' ORDER BY c.created_at DESC';

    const courses = db.prepare(query).all(...params);
    res.json({ courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const course = db.prepare(`
      SELECT c.*,
        t.first_name || ' ' || t.last_name as teacher_name,
        t.email as teacher_email
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get enrolled students
    const students = db.prepare(`
      SELECT s.*, e.enrollment_date, e.status as enrollment_status
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.course_id = ?
    `).all(req.params.id);

    res.json({ course, students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create course
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const {
      code, name, description, teacher_id, capacity = 30, credits = 3,
      start_date, end_date, schedule, room, status = 'active'
    } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Course code and name are required' });
    }

    const result = db.prepare(`
      INSERT INTO courses (
        code, name, description, teacher_id, capacity, credits,
        start_date, end_date, schedule, room, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      code, name, description, teacher_id, capacity, credits,
      start_date, end_date, schedule, room, status
    );

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Course code already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update course
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const {
      code, name, description, teacher_id, capacity, credits,
      start_date, end_date, schedule, room, status
    } = req.body;

    const result = db.prepare(`
      UPDATE courses SET
        code = COALESCE(?, code),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        teacher_id = COALESCE(?, teacher_id),
        capacity = COALESCE(?, capacity),
        credits = COALESCE(?, credits),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        schedule = COALESCE(?, schedule),
        room = COALESCE(?, room),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      code, name, description, teacher_id, capacity, credits,
      start_date, end_date, schedule, room, status,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
