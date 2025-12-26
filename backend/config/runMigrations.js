import { pool } from './mysql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  try {
    console.log('🛠️ Running database migrations...');
    
    // Migration files to run
    const migrationFiles = [
      'create_payment_tables.sql',
      'create_exam_tables.sql'
    ];
    
    for (const file of migrationFiles) {
      console.log(`📝 Running migration: ${file}`);
      
      const migrationPath = path.join(__dirname, '../migrations', file);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️ Migration file not found: ${file}`);
        continue;
      }
      
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
            throw err;
          }
        }
      }
      
      console.log(`✅ Migration completed: ${file}`);
    }
    
    console.log('✅ All database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    // Don't crash the server if tables already exist
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Tables already exist, skipping migration');
    } else {
      console.error('❌ Fatal migration error:', error);
    }
  }
};