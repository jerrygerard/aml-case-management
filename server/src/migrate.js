const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const migration = require(path.join(migrationsDir, file));
    try {
      await migration.up();
      console.log(`Successfully ran migration: ${file}`);
    } catch (error) {
      console.error(`Error running migration ${file}:`, error);
      process.exit(1);
    }
  }
}

runMigrations()
  .then(() => {
    console.log('All migrations completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 