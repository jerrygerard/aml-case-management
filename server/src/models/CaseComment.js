const db = require('../config/database');

class CaseComment {
  static async create(commentData) {
    const { case_id, author, content, is_private } = commentData;
    const query = `
      INSERT INTO case_comments (case_id, author, content, is_private)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [case_id, author, content, is_private];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByCaseId(caseId) {
    const query = `
      SELECT *
      FROM case_comments
      WHERE case_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [caseId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT *
      FROM case_comments
      WHERE id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM case_comments WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = CaseComment; 