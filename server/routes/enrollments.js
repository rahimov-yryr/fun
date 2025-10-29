import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all enrollments
router.get('/', authenticateToken, (req, res) => {
  try {
    const { student_id, course_id, status } = req.query;
    let query = `
      SELECT e.*,
        s.first_name || ' ' || s.last_name as student_name,
        c.name as course_name, c.code as course_code
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ' AND e.student_id = ?';
      params.push(student_id);
    }

    if (course_id) {
      query += ' AND e.course_id = ?';
      params.push(course_id);
    }

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    query += ' ORDER BY e.created_at DESC';

    const enrollments = db.prepare(query).all(...params);
    res.json({ enrollments, count: enrollments.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create enrollment
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const { student_id, course_id, enrollment_date, notes } = req.body;

    if (!student_id || !course_id) {
      return res.status(400).json({ error: 'Student ID and Course ID are required' });
    }

    // Check if course has capacity
    const course = db.prepare(`
      SELECT capacity,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = ? AND status = 'enrolled') as enrolled
      FROM courses WHERE id = ?
    `).get(course_id, course_id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.enrolled >= course.capacity) {
      return res.status(400).json({ error: 'Course is at full capacity' });
    }

    const result = db.prepare(`
      INSERT INTO enrollments (student_id, course_id, enrollment_date, notes)
      VALUES (?, ?, ?, ?)
    `).run(student_id, course_id, enrollment_date || new Date().toISOString().split('T')[0], notes);

    const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Enrollment created successfully', enrollment });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Student is already enrolled in this course' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update enrollment
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const { status, final_grade, attendance_percentage, notes } = req.body;

    const result = db.prepare(`
      UPDATE enrollments SET
        status = COALESCE(?, status),
        final_grade = COALESCE(?, final_grade),
        attendance_percentage = COALESCE(?, attendance_percentage),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, final_grade, attendance_percentage, notes, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const enrollment = db.prepare('SELECT * FROM enrollments WHERE id = ?').get(req.params.id);
    res.json({ message: 'Enrollment updated successfully', enrollment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete enrollment (drop course)
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM enrollments WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
