-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS chat_prompts_settings;
DROP TABLE IF EXISTS chat_analysis;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS user_companies;
DROP TABLE IF EXISTS ai_prompts;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(255) NOT NULL UNIQUE DEFAULT 'COMPANY_' || nextval('companies_id_seq'),
    unique_id VARCHAR(255) NOT NULL UNIQUE DEFAULT 'COMPANY_' || extract(epoch from now()) || '_' || floor(random() * 10000),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_companies table
CREATE TABLE user_companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);

-- Create chats table
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    custom_prompt TEXT DEFAULT '',
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_analysis table
CREATE TABLE chat_analysis (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    analysis_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    has_new_messages BOOLEAN DEFAULT TRUE
);

-- Create ai_prompts table
CREATE TABLE ai_prompts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    prompt_text TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_prompts_settings table
CREATE TABLE chat_prompts_settings (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    dialog_analysis_prompt TEXT DEFAULT '',
    neirowork_prompt TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default prompts
INSERT INTO ai_prompts (name, prompt_text, version) 
VALUES 
    ('dialog_analysis', 'Проанализируй этот диалог. Выпиши основные темы, проблемы, договорённости, важные факты. Ответ давать кратко, структурированно.', 1),
    ('global_prompt', 'Глобальный промт по умолчанию. Этот промт используется как основа для всех операций в системе, если не указаны более специфичные настройки.', 1),
    ('neiro_work', 'Ты — менеджер по организации работы. На основе анализа диалога составь: 1. Главные выводы 2. Проблемы, на которые стоит обратить внимание 3. Чек-лист задач (to-do) 4. Рекомендации по дальнейшим действиям Ответ давать по пунктам, чётко, без воды.', 1);

-- Insert default user
INSERT INTO users (username, password, email) 
VALUES ('user1', 'password123', 'user1@example.com');

-- Insert default company with unique_id
INSERT INTO companies (name, description, code, unique_id, created_by) 
VALUES ('company1', 'Default company for user1', 'COMPANY1', 'COMPANY1_UNIQUE_ID', 1);

-- Add user to company as owner
INSERT INTO user_companies (user_id, company_id, role) 
VALUES (1, 1, 'owner');
