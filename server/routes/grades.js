import express from 'express';
import dbWrapper from '../database/wrapper.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get grades for an enrollment
router.get('/enrollment/:enrollmentId', authenticateToken, (req, res) => {
  try {
    const grades = dbWrapper.prepare(`
      SELECT * FROM grades
      WHERE enrollment_id = ?
      ORDER BY due_date DESC
    `).all(req.params.enrollmentId);

    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalWeight = 0;

    grades.forEach(grade => {
      const percentage = (grade.score / grade.max_score) * 100;
      totalWeightedScore += percentage * grade.weight;
      totalWeight += grade.weight;
    });

    const averageGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    res.json({ grades, averageGrade: averageGrade.toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all grades for a student
router.get('/student/:studentId', authenticateToken, (req, res) => {
  try {
    const grades = dbWrapper.prepare(`
      SELECT g.*, e.course_id, c.name as course_name, c.code as course_code
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ?
      ORDER BY g.due_date DESC
    `).all(req.params.studentId);

    res.json({ grades });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create grade
router.post('/', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const {
      enrollment_id, assignment_name, assignment_type, score, max_score,
      weight = 1.0, due_date, submitted_date, feedback
    } = req.body;

    if (!enrollment_id || !assignment_name || score === undefined || max_score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = dbWrapper.prepare(`
      INSERT INTO grades (
        enrollment_id, assignment_name, assignment_type, score, max_score,
        weight, due_date, submitted_date, feedback
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      enrollment_id, assignment_name, assignment_type, score, max_score,
      weight, due_date, submitted_date, feedback
    );

    const grade = dbWrapper.prepare('SELECT * FROM grades WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Grade created successfully', grade });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update grade
router.put('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const {
      assignment_name, assignment_type, score, max_score,
      weight, due_date, submitted_date, feedback
    } = req.body;

    const result = dbWrapper.prepare(`
      UPDATE grades SET
        assignment_name = COALESCE(?, assignment_name),
        assignment_type = COALESCE(?, assignment_type),
        score = COALESCE(?, score),
        max_score = COALESCE(?, max_score),
        weight = COALESCE(?, weight),
        due_date = COALESCE(?, due_date),
        submitted_date = COALESCE(?, submitted_date),
        feedback = COALESCE(?, feedback),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      assignment_name, assignment_type, score, max_score,
      weight, due_date, submitted_date, feedback,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    const grade = dbWrapper.prepare('SELECT * FROM grades WHERE id = ?').get(req.params.id);
    res.json({ message: 'Grade updated successfully', grade });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete grade
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const result = dbWrapper.prepare('DELETE FROM grades WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
