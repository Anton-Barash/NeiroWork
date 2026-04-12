// d:\neiroQC\NeiroWork\backend\src\config\database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'neirowork',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');

    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  try {
    // Check companies table structure
    try {
      const tableInfo = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'companies'
      `);
      console.log('Companies table structure:', tableInfo.rows);
    } catch (infoError) {
      console.log('Could not check companies table structure:', infoError);
    }

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        code VARCHAR(255) NOT NULL UNIQUE,
        unique_id VARCHAR(255) NOT NULL UNIQUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_companies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company_id)
      )
    `);

    // Create chats table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(255) NOT NULL,
        custom_prompt TEXT DEFAULT '',
        use_custom_prompt BOOLEAN DEFAULT FALSE,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create files table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(255) NOT NULL,
        size INTEGER NOT NULL,
        type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat_analysis table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_analysis (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        analysis_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        has_new_messages BOOLEAN DEFAULT TRUE
      )
    `);

    // Create ai_prompts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_prompts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        prompt_text TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat_prompts_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_prompts_settings (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        dialog_analysis_prompt TEXT DEFAULT '',
        neirowork_prompt TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create test table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test (
        id SERIAL PRIMARY KEY,
        test TEXT NOT NULL UNIQUE
      )
    `);

    // Clear existing test data to ensure only one record
    await pool.query(`DELETE FROM test`);

    // Insert test data
    await pool.query(`
      INSERT INTO test (test)
      VALUES ('test')
    `);

    // Insert default prompts if they don't exist
    await pool.query(`
      INSERT INTO ai_prompts (name, prompt_text, version) 
      VALUES 
        ('dialog_analysis', 'Проанализируй этот диалог. Выпиши основные темы, проблемы, договорённости, важные факты. Ответ давать кратко, структурированно.', 1),
        ('global_prompt', 'Глобальный промт по умолчанию. Этот промт используется как основа для всех операций в системе, если не указаны более специфичные настройки.', 1),
        ('neiro_work', 'Ты — менеджер по организации работы. На основе анализа диалога составь: 1. Главные выводы 2. Проблемы, на которые стоит обратить внимание 3. Чек-лист задач (to-do) 4. Рекомендации по дальнейшим действиям Ответ давать по пунктам, чётко, без воды.', 1)
      ON CONFLICT (name) DO NOTHING
    `);

    // Insert default user and company for testing
    await pool.query(`
      INSERT INTO companies (name, description, code, unique_id, created_by) 
      VALUES ('company1', 'Default company for user1', 'COMPANY1', 'COMPANY1_UNIQUE_ID', 1)
      ON CONFLICT (code) DO NOTHING
    `);

    await pool.query(`
      INSERT INTO users (username, password, email) 
      VALUES ('user1', 'password123', 'user1@example.com')
      ON CONFLICT (username) DO NOTHING
    `);

    // Add default user to company as owner
    await pool.query(`
      INSERT INTO user_companies (user_id, company_id, role) 
      VALUES (1, 1, 'owner')
      ON CONFLICT (user_id, company_id) DO NOTHING
    `);

    console.log('Database tables created successfully');

    // Migration: Add user_id column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('Migration: user_id column added to messages table');
    } catch (migrationError) {
      // Ignore if column already exists or other error
      console.log('Migration: user_id column already exists or migration skipped');
    }
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

export default pool;