import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Dashboard overview
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const stats = {
      totalStudents: db.prepare('SELECT COUNT(*) as count FROM students WHERE status = "active"').get().count,
      totalCourses: db.prepare('SELECT COUNT(*) as count FROM courses WHERE status = "active"').get().count,
      totalTeachers: db.prepare('SELECT COUNT(*) as count FROM teachers WHERE status = "active"').get().count,
      totalEnrollments: db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE status = "enrolled"').get().count,
    };

    // Recent enrollments
    const recentEnrollments = db.prepare(`
      SELECT e.*, s.first_name || ' ' || s.last_name as student_name, c.name as course_name
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.created_at DESC
      LIMIT 10
    `).all();

    // Course enrollment statistics
    const courseStats = db.prepare(`
      SELECT
        c.name,
        c.capacity,
        COUNT(e.id) as enrolled_count,
        ROUND(COUNT(e.id) * 100.0 / c.capacity, 2) as fill_percentage
      FROM courses c
      LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.status = 'enrolled'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY fill_percentage DESC
      LIMIT 10
    `).all();

    res.json({
      stats,
      recentEnrollments,
      courseStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student performance analytics
router.get('/student-performance', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const performance = db.prepare(`
      SELECT
        s.id,
        s.first_name || ' ' || s.last_name as student_name,
        COUNT(DISTINCT e.id) as total_courses,
        ROUND(AVG((g.score / g.max_score) * 100), 2) as average_grade,
        ROUND(AVG(e.attendance_percentage), 2) as average_attendance
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN grades g ON e.id = g.enrollment_id
      WHERE s.status = 'active'
      GROUP BY s.id
      ORDER BY average_grade DESC
      LIMIT 20
    `).all();

    res.json({ performance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Course performance analytics
router.get('/course-performance', authenticateToken, authorizeRoles('admin', 'teacher'), (req, res) => {
  try {
    const performance = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.code,
        COUNT(DISTINCT e.id) as enrolled_students,
        ROUND(AVG((g.score / g.max_score) * 100), 2) as average_grade,
        t.first_name || ' ' || t.last_name as teacher_name
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'enrolled'
      LEFT JOIN grades g ON e.id = g.enrollment_id
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY enrolled_students DESC
    `).all();

    res.json({ performance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enrollment trends
router.get('/enrollment-trends', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const trends = db.prepare(`
      SELECT
        DATE(enrollment_date) as date,
        COUNT(*) as enrollments
      FROM enrollments
      WHERE enrollment_date >= DATE('now', '-30 days')
      GROUP BY DATE(enrollment_date)
      ORDER BY date ASC
    `).all();

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher workload
router.get('/teacher-workload', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const workload = db.prepare(`
      SELECT
        t.id,
        t.first_name || ' ' || t.last_name as teacher_name,
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT e.student_id) as total_students,
        t.specialization
      FROM teachers t
      LEFT JOIN courses c ON t.id = c.teacher_id AND c.status = 'active'
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'enrolled'
      WHERE t.status = 'active'
      GROUP BY t.id
      ORDER BY total_students DESC
    `).all();

    res.json({ workload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
