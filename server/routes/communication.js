import express from 'express';
import dbWrapper from '../database/wrapper.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get communications
router.get('/', authenticateToken, (req, res) => {
  try {
    const { recipient_id, type, status } = req.query;
    let query = `
      SELECT c.*,
        sender.email as sender_email
      FROM communications c
      LEFT JOIN users sender ON c.sender_id = sender.id
      WHERE (c.recipient_id = ? OR c.recipient_type = 'all')
    `;
    const params = [req.user.id];

    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.sent_at DESC';

    const communications = dbWrapper.prepare(query).all(...params);
    res.json({ communications, count: communications.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send communication
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      recipient_id, recipient_type = 'user', subject, message,
      type = 'notification'
    } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const result = dbWrapper.prepare(`
      INSERT INTO communications (
        sender_id, recipient_id, recipient_type, subject, message, type
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, recipient_id, recipient_type, subject, message, type);

    const communication = dbWrapper.prepare('SELECT * FROM communications WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Communication sent successfully', communication });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    const result = dbWrapper.prepare(`
      UPDATE communications
      SET status = 'read', read_at = CURRENT_TIMESTAMP
      WHERE id = ? AND recipient_id = ?
    `).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    res.json({ message: 'Communication marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete communication
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = dbWrapper.prepare(`
      DELETE FROM communications
      WHERE id = ? AND (sender_id = ? OR recipient_id = ?)
    `).run(req.params.id, req.user.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    res.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
