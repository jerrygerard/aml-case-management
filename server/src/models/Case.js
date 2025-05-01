const db = require('../config/database');

class Case {
  static async create(caseData) {
    const query = `
      INSERT INTO cases (title, description, status, priority, risk_level, assigned_to, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      caseData.title,
      caseData.description,
      caseData.status,
      caseData.priority,
      caseData.risk_level,
      caseData.assigned_to,
      caseData.created_by
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const query = `
        SELECT *
        FROM cases
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `;
      const result = await db.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error in Case.findAll:', error);
      return [];
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT *
        FROM cases
        WHERE id = $1;
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Case.findById:', error);
      return null;
    }
  }

  static async update(id, caseData) {
    const query = `
      UPDATE cases
      SET 
        title = $1,
        description = $2,
        status = $3,
        priority = $4,
        risk_level = $5,
        assigned_to = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      caseData.title,
      caseData.description,
      caseData.status,
      caseData.priority,
      caseData.risk_level,
      caseData.assigned_to,
      id
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM cases WHERE id = $1;';
    await db.query(query, [id]);
  }
}

module.exports = Case; 