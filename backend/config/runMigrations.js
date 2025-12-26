import { pool } from './mysql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  try {
    console.log('🛠️ Running database migrations...');
    
    // Read SQL file
    const migrationPath = path.join(__dirname, '../migrations/create_payment_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      await pool.query(statement);
    }
    
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    // Don't crash the server if tables already exist
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Tables already exist, skipping migration');
    }
  }
};