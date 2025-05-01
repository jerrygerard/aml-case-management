const db = require('../config/database');

class CaseAttachment {
  static async create(attachmentData) {
    const { case_id, filename, file_type, file_size, file_path, uploaded_by, description } = attachmentData;
    const query = `
      INSERT INTO case_attachments (case_id, filename, file_type, file_size, file_path, uploaded_by, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [case_id, filename, file_type, file_size, file_path, uploaded_by, description];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByCaseId(caseId) {
    const query = `
      SELECT *
      FROM case_attachments
      WHERE case_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [caseId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT *
      FROM case_attachments
      WHERE id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM case_attachments WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = CaseAttachment; 