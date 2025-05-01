const db = require('../config/database');

async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS cases (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'pending_review', 'closed', 'archived')),
      priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
      risk_level VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
      assigned_to VARCHAR(255),
      created_by VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS case_entities (
      id SERIAL PRIMARY KEY,
      case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS case_attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_size INTEGER NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      uploaded_by VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS case_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
      author VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      is_private BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function down() {
  await db.query('DROP TABLE IF EXISTS case_comments;');
  await db.query('DROP TABLE IF EXISTS case_attachments;');
  await db.query('DROP TABLE IF EXISTS case_entities;');
  await db.query('DROP TABLE IF EXISTS cases;');
}

module.exports = { up, down }; 