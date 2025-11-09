import express from 'express';
import dbWrapper from '../database/wrapper.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all teachers
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM teachers WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const teachers = dbWrapper.prepare(query).all(...params);
    res.json({ teachers, count: teachers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single teacher
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const teacher = dbWrapper.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Get courses taught by this teacher
    const courses = dbWrapper.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'enrolled') as enrolled_count
      FROM courses c
      WHERE c.teacher_id = ?
    `).all(req.params.id);

    res.json({ teacher, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create teacher
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, specialization,
      qualification, hire_date, status = 'active', bio
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const result = dbWrapper.prepare(`
      INSERT INTO teachers (
        first_name, last_name, email, phone, specialization,
        qualification, hire_date, status, bio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      first_name, last_name, email, phone, specialization,
      qualification, hire_date, status, bio
    );

    const teacher = dbWrapper.prepare('SELECT * FROM teachers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Teacher created successfully', teacher });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update teacher
router.put('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, specialization,
      qualification, status, bio
    } = req.body;

    const result = dbWrapper.prepare(`
      UPDATE teachers SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        specialization = COALESCE(?, specialization),
        qualification = COALESCE(?, qualification),
        status = COALESCE(?, status),
        bio = COALESCE(?, bio),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      first_name, last_name, email, phone, specialization,
      qualification, status, bio,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacher = dbWrapper.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
    res.json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete teacher
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const result = dbWrapper.prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
