const db = require('../config/database');

class CaseActivity {
  static async create(activityData) {
    const { case_id, user_id, activity_type, description } = activityData;
    const query = `
      INSERT INTO case_activities (case_id, user_id, activity_type, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [case_id, user_id, activity_type, description];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByCaseId(caseId) {
    const query = `
      SELECT *
      FROM case_activities
      WHERE case_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [caseId]);
    return result.rows;
  }
}

module.exports = CaseActivity; 