const Case = require('../models/Case');
const CaseAttachment = require('../models/CaseAttachment');
const CaseComment = require('../models/CaseComment');
const CaseActivity = require('../models/CaseActivity');
const db = require('../config/database');

class CaseController {
  static async createCase(req, res) {
    try {
      const caseData = req.body;
      const newCase = await Case.create(caseData);
      
      // Record activity
      await CaseActivity.create({
        case_id: newCase.id,
        user_id: req.user?.id || 'anonymous',
        activity_type: 'case_created',
        description: `Case "${newCase.title}" was created`
      });

      res.status(201).json({ data: newCase });
    } catch (error) {
      console.error('Error creating case:', error);
      res.status(500).json({ error: 'Failed to create case' });
    }
  }

  static async getCases(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const cases = await Case.findAll(parseInt(page), parseInt(limit));
      
      // Get total count
      const countResult = await db.query('SELECT COUNT(*) FROM cases');
      const total = parseInt(countResult.rows[0].count);
      
      res.json({ 
        data: {
          cases,
          total
        }
      });
    } catch (error) {
      console.error('Error fetching cases:', error);
      res.status(500).json({ error: 'Failed to fetch cases' });
    }
  }

  static async getCase(req, res) {
    try {
      const caseId = req.params.id;
      const caseData = await Case.findById(caseId);
      
      if (!caseData) {
        return res.status(404).json({ error: 'Case not found' });
      }

      // Get attachments, comments, and activities
      let attachments = [];
      let comments = [];
      let activities = [];

      try {
        attachments = await CaseAttachment.findByCaseId(caseId);
      } catch (error) {
        console.warn('Error fetching attachments:', error);
      }

      try {
        comments = await CaseComment.findByCaseId(caseId);
      } catch (error) {
        console.warn('Error fetching comments:', error);
      }

      try {
        activities = await CaseActivity.findByCaseId(caseId);
      } catch (error) {
        console.warn('Error fetching activities:', error);
      }

      res.json({ 
        data: {
          ...caseData,
          attachments,
          comments,
          activities
        }
      });
    } catch (error) {
      console.error('Error fetching case:', error);
      res.status(500).json({ error: 'Failed to fetch case' });
    }
  }

  static async updateCase(req, res) {
    try {
      const caseId = req.params.id;
      const caseData = req.body;
      const updatedCase = await Case.update(caseId, caseData);

      // Record activity for each changed field
      const changes = [];
      if (caseData.status) changes.push(`status changed to ${caseData.status}`);
      if (caseData.priority) changes.push(`priority changed to ${caseData.priority}`);
      if (caseData.risk_level) changes.push(`risk level changed to ${caseData.risk_level}`);
      if (caseData.assigned_to) changes.push(`assigned to ${caseData.assigned_to}`);

      if (changes.length > 0) {
        await CaseActivity.create({
          case_id: caseId,
          user_id: req.user?.id || 'anonymous',
          activity_type: 'case_updated',
          description: `Case was updated: ${changes.join(', ')}`
        });
      }

      res.json({ data: updatedCase });
    } catch (error) {
      console.error('Error updating case:', error);
      res.status(500).json({ error: 'Failed to update case' });
    }
  }

  static async deleteCase(req, res) {
    try {
      const caseId = req.params.id;
      await Case.delete(caseId);
      res.json({ data: { message: 'Case deleted successfully' } });
    } catch (error) {
      console.error('Error deleting case:', error);
      res.status(500).json({ error: 'Failed to delete case' });
    }
  }

  static async addEntityToCase(req, res) {
    try {
      const { caseId, entityId } = req.params;
      const { relationship_type, notes } = req.body;

      const query = `
        INSERT INTO case_entities (case_id, entity_id, relationship_type, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values = [caseId, entityId, relationship_type, notes];
      
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding entity to case:', error);
      res.status(500).json({ error: 'Failed to add entity to case' });
    }
  }

  static async addNoteToCase(req, res) {
    try {
      const caseId = req.params.id;
      const { content, is_private } = req.body;

      const query = `
        INSERT INTO case_notes (case_id, author_id, content, is_private)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values = [caseId, req.user.id, content, is_private];
      
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding note to case:', error);
      res.status(500).json({ error: 'Failed to add note to case' });
    }
  }

  static async getCaseStats(req, res) {
    try {
      // Get case counts
      const countsQuery = `
        SELECT 
          COUNT(*) as total_cases,
          COUNT(*) FILTER (WHERE status = 'open') as open_cases,
          COUNT(*) FILTER (WHERE priority = 'high' OR priority = 'critical') as high_priority
        FROM cases;
      `;

      // Get recent activity
      const activityQuery = `
        SELECT id, title, status, created_at
        FROM cases
        ORDER BY created_at DESC
        LIMIT 5;
      `;

      const [countsResult, activityResult] = await Promise.all([
        db.query(countsQuery),
        db.query(activityQuery)
      ]);

      const stats = {
        totalCases: parseInt(countsResult.rows[0].total_cases),
        openCases: parseInt(countsResult.rows[0].open_cases),
        highPriority: parseInt(countsResult.rows[0].high_priority),
        recentActivity: activityResult.rows
      };

      res.json({ data: stats });
    } catch (error) {
      console.error('Error fetching case stats:', error);
      res.status(500).json({ error: 'Failed to fetch case stats' });
    }
  }
}

module.exports = CaseController;