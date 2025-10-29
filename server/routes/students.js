import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR parent_email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC';

    const students = db.prepare(query).all(...params);
    res.json({ students, count: students.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single student
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get enrollments
    const enrollments = db.prepare(`
      SELECT e.*, c.name as course_name, c.code as course_code
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ?
    `).all(req.params.id);

    res.json({ student, enrollments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create student
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const {
      first_name, last_name, date_of_birth, gender, phone, address,
      emergency_contact, parent_name, parent_email, parent_phone,
      enrollment_date, status = 'active', notes
    } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const result = db.prepare(`
      INSERT INTO students (
        first_name, last_name, date_of_birth, gender, phone, address,
        emergency_contact, parent_name, parent_email, parent_phone,
        enrollment_date, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      first_name, last_name, date_of_birth, gender, phone, address,
      emergency_contact, parent_name, parent_email, parent_phone,
      enrollment_date, status, notes
    );

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const {
      first_name, last_name, date_of_birth, gender, phone, address,
      emergency_contact, parent_name, parent_email, parent_phone, status, notes
    } = req.body;

    const result = db.prepare(`
      UPDATE students SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        emergency_contact = COALESCE(?, emergency_contact),
        parent_name = COALESCE(?, parent_name),
        parent_email = COALESCE(?, parent_email),
        parent_phone = COALESCE(?, parent_phone),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      first_name, last_name, date_of_birth, gender, phone, address,
      emergency_contact, parent_name, parent_email, parent_phone, status, notes,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student statistics
router.get('/:id/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      totalCourses: db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE student_id = ?').get(req.params.id).count,
      activeCourses: db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND status = "enrolled"').get(req.params.id).count,
      completedCourses: db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND status = "completed"').get(req.params.id).count,
      averageGrade: db.prepare(`
        SELECT AVG((score / max_score) * 100) as avg
        FROM grades g
        JOIN enrollments e ON g.enrollment_id = e.id
        WHERE e.student_id = ?
      `).get(req.params.id).avg || 0
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
