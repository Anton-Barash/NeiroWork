import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import pool from '../config/database';
// Заглушка для getChatCompletion, если модуль не найден
let getChatCompletion: (messages: any) => Promise<string>;
try {
  getChatCompletion = require('../config/doubao').getChatCompletion;
} catch {
  getChatCompletion = async () => '[AI response unavailable]';
}


interface CreateChatRequest {
  topic: string;
}

interface SendMessageRequest {
  chat_id: number;
  content: string;
  parent_id?: number;
}

const chatRoutes = async (app: FastifyInstance) => {
  // Create new chat
  app.post('/create', async (request: FastifyRequest<{ Body: CreateChatRequest }>, reply: FastifyReply) => {
    try {
      const { topic } = request.body;
      const result = await pool.query(
        'INSERT INTO chats (topic) VALUES ($1) RETURNING id, topic, created_at',
        [topic]
      );
      reply.send(result.rows[0]);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create chat' });
    }
  });

  // Get all chats
  app.get('/list', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await pool.query(
        'SELECT id, topic, created_at FROM chats ORDER BY created_at DESC'
      );
      reply.send(result.rows);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to get chats' });
    }
  });

  // Get chat messages
  app.get('/:chatId/messages', async (request: FastifyRequest<{ Params: { chatId: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const result = await pool.query(
        'SELECT id, parent_id, content, role, created_at FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
        [chatId]
      );
      reply.send(result.rows);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to get messages' });
    }
  });

  // Send message
  app.post('/send', async (request: FastifyRequest<{ Body: SendMessageRequest }>, reply: FastifyReply) => {
    try {
      const { chat_id, content, parent_id } = request.body;
      // Save user message
      const userMessageResult = await pool.query(
        'INSERT INTO messages (chat_id, parent_id, content, role) VALUES ($1, $2, $3, $4) RETURNING id, parent_id, content, role, created_at',
        [chat_id, parent_id, content, 'user']
      );
      // Get chat history
      const historyResult = await pool.query(
        'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
        [chat_id]
      );
      const messages = historyResult.rows.map(row => ({
        role: row.role,
        content: row.content
      }));
      // Get AI response
      const aiResponse = await getChatCompletion(messages);
      // Save AI message
      const aiMessageResult = await pool.query(
        'INSERT INTO messages (chat_id, parent_id, content, role) VALUES ($1, $2, $3, $4) RETURNING id, parent_id, content, role, created_at',
        [chat_id, userMessageResult.rows[0].id, aiResponse, 'assistant']
      );
      reply.send({
        userMessage: userMessageResult.rows[0],
        aiMessage: aiMessageResult.rows[0]
      });
    } catch (error) {
      console.error('Send message error:', error);
      reply.status(500).send({ error: 'Failed to send message' });
    }
  });

  // Delete chat
  app.delete('/:chatId', async (request: FastifyRequest<{ Params: { chatId: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      await pool.query('DELETE FROM chats WHERE id = $1', [chatId]);
      reply.send({ success: true });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete chat' });
    }
  });
};



export default chatRoutes;