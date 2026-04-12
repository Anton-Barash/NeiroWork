import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import pool from '../config/database';
import { getChatCompletion, getChatCompletionWithPrompt } from '../config/doubao';

interface CreateChatRequest {
  topic: string;
}

interface SendMessageRequest {
  chat_id: number;
  content: string;
  parent_id?: number;
}

interface AnalyzeChatRequest {
  chat_id: number;
}

const chatRoutes = async (app: FastifyInstance) => {
  // Create new chat
  app.post('/create', async (request: FastifyRequest<{ Body: CreateChatRequest & { company_id: number } }>, reply: FastifyReply) => {
    try {
      const { topic, company_id } = request.body;
      const result = await pool.query(
        'INSERT INTO chats (topic, company_id) VALUES ($1, $2) RETURNING id, topic, company_id, created_at',
        [topic, company_id]
      );
      reply.send(result.rows[0]);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create chat' });
    }
  });

  // Get all chats
  app.get('/list', async (request: FastifyRequest<{ Querystring: { company_id?: number } }>, reply: FastifyReply) => {
    try {
      const { company_id } = request.query;
      let query = 'SELECT id, topic, company_id, created_at FROM chats';
      const params = [];

      if (company_id) {
        query += ' WHERE company_id = $1';
        params.push(company_id);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      reply.send(result.rows);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to get chats' });
    }
  });

  // Get chat messages
  app.get('/:chatId/chat-messages', async (request: FastifyRequest<{ Params: { chatId: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      console.log('[GET /:chatId/messages] Fetching messages for chat:', chatId);
      const result = await pool.query(
        'SELECT m.id, m.parent_id, m.user_id, m.content, m.role, m.created_at, u.username FROM messages m LEFT JOIN users u ON m.user_id = u.id WHERE m.chat_id = $1 ORDER BY m.created_at ASC',
        [chatId]
      );
      console.log('[GET /:chatId/messages] Found messages:', result.rows.length);
      reply.send(result.rows);
    } catch (error) {
      console.error('[GET /:chatId/messages] Error:', error);
      reply.status(500).send({ error: 'Failed to get messages' });
    }
  });

  // Send message
  interface SendMessageBody {
    chat_id: number;
    content: string;
    parent_id?: number;
    images?: Array<{ url: string }>;
    user_id?: number;
  }

  app.post('/send', async (request: FastifyRequest<{ Body: SendMessageBody }>, reply: FastifyReply) => {
    try {
      const { chat_id, content, parent_id, images, user_id } = request.body;

      if (!chat_id || !content) {
        return reply.status(400).send({ error: 'chat_id and content are required' });
      }

      const messageUserId = user_id || null;

      let messageContent: string | Array<{ type: string, text?: string, image_url?: { url: string } }>;

      if (images && images.length > 0) {
        messageContent = [];
        if (content && content.trim()) {
          messageContent.push({ type: 'text', text: content });
        }
        for (const image of images) {
          messageContent.push({
            type: 'image_url',
            image_url: { url: image.url }
          });
        }
      } else {
        messageContent = content;
      }

      const storedContent = typeof messageContent === 'string'
        ? messageContent
        : JSON.stringify(messageContent);

      const userMessageResult = await pool.query(
        'INSERT INTO messages (chat_id, parent_id, user_id, content, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, parent_id, user_id, content, role, created_at',
        [chat_id, parent_id, messageUserId, storedContent, 'user']
      );

      const historyResult = await pool.query(
        'SELECT id, user_id, role, content, created_at FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
        [chat_id]
      );

      const messages = historyResult.rows.map(row => {
        try {
          const parsed = JSON.parse(row.content);
          return {
            id: row.id,
            user_id: row.user_id,
            role: row.role,
            content: typeof parsed === 'object' ? parsed : String(parsed),
            created_at: row.created_at
          };
        } catch {
          return { id: row.id, user_id: row.user_id, role: row.role, content: row.content, created_at: row.created_at };
        }
      });

      const existingAnalysis = await pool.query(
        'SELECT id FROM chat_analysis WHERE chat_id = $1',
        [chat_id]
      );

      if (existingAnalysis.rows.length > 0) {
        await pool.query(
          'UPDATE chat_analysis SET has_new_messages = TRUE WHERE chat_id = $1',
          [chat_id]
        );
      } else {
        await pool.query(
          'INSERT INTO chat_analysis (chat_id, analysis_text, has_new_messages) VALUES ($1, \'\', TRUE)',
          [chat_id]
        );
      }

      reply.send({
        userMessage: userMessageResult.rows[0]
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
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM messages WHERE chat_id = $1', [chatId]);
        await client.query('DELETE FROM chat_analysis WHERE chat_id = $1', [chatId]);
        await client.query('DELETE FROM chats WHERE id = $1', [chatId]);
        await client.query('COMMIT');
        reply.send({ success: true });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete chat' });
    }
  });

  // Analyze chat
  app.post('/:chatId/analyze', async (request: FastifyRequest<{ Params: { chatId: string }; Body: AnalyzeChatRequest }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;

      const existingAnalysisResult = await pool.query(
        'SELECT id, analysis_text FROM chat_analysis WHERE chat_id = $1 AND has_new_messages = FALSE',
        [chatId]
      );

      if (existingAnalysisResult.rows.length > 0) {
        reply.send({ analysis: existingAnalysisResult.rows[0].analysis_text });
        return;
      }

      const messagesResult = await pool.query(
        'SELECT m.role, m.content, u.username FROM messages m LEFT JOIN users u ON m.user_id = u.id WHERE m.chat_id = $1 ORDER BY m.created_at ASC',
        [chatId]
      );

      if (messagesResult.rows.length === 0) {
        reply.send({ analysis: 'No messages to analyze.' });
        return;
      }

      const settingsResult = await pool.query(
        'SELECT dialog_analysis_prompt FROM chat_prompts_settings WHERE chat_id = $1',
        [chatId]
      );

      const defaultPromptResult = await pool.query(
        'SELECT prompt_text FROM ai_prompts WHERE name = $1',
        ['global_prompt']
      );

      if (defaultPromptResult.rows.length === 0) {
        throw new Error('Global prompt not found');
      }

      const chatCustomPromptResult = await pool.query(
        'SELECT custom_prompt, use_custom_prompt FROM chats WHERE id = $1',
        [chatId]
      );

      let prompt = defaultPromptResult.rows[0].prompt_text;
      if (settingsResult.rows[0]?.dialog_analysis_prompt) {
        prompt = settingsResult.rows[0].dialog_analysis_prompt;
      }
      if (chatCustomPromptResult.rows[0]?.custom_prompt && chatCustomPromptResult.rows[0]?.use_custom_prompt) {
        prompt += `\n\nAdditional instructions: ${chatCustomPromptResult.rows[0].custom_prompt}`;
      }

      const context = messagesResult.rows.map(msg => `${msg.username || msg.role}: ${msg.content}`).join('\n');

      const analysis = await getChatCompletionWithPrompt(prompt, context);

      const updateResult = await pool.query(
        'UPDATE chat_analysis SET analysis_text = $1, has_new_messages = FALSE WHERE chat_id = $2',
        [analysis, chatId]
      );

      if (updateResult.rowCount === 0) {
        await pool.query(
          'INSERT INTO chat_analysis (chat_id, analysis_text, has_new_messages) VALUES ($1, $2, FALSE)',
          [chatId, analysis]
        );
      }

      reply.send({ analysis });
    } catch (error) {
      console.error('Analyze chat error:', error);
      reply.status(500).send({ error: 'Failed to analyze chat' });
    }
  });

  // Get chat analysis
  app.get('/:chatId/analysis', async (request: FastifyRequest<{ Params: { chatId: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const result = await pool.query(
        'SELECT analysis_text, has_new_messages, created_at FROM chat_analysis WHERE chat_id = $1',
        [chatId]
      );
      if (result.rows.length === 0) {
        reply.send({ analysis: null, has_new_messages: true });
        return;
      }
      console.log(result.rows[0]);
      reply.send(result.rows[0]);

    } catch (error) {
      console.error('Get chat analysis error:', error);
      reply.status(500).send({ error: 'Failed to get chat analysis' });
    }
  });

  // Get chat images
  app.get('/:chatId/images', async (request: FastifyRequest<{ Params: { chatId: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const result = await pool.query(
        'SELECT id, filename, filepath, size, type, created_at FROM files WHERE chat_id = $1 AND type LIKE $2 ORDER BY created_at DESC',
        [chatId, 'image/%']
      );
      const images = result.rows.map(row => ({
        ...row,
        url: `${request.protocol}://${request.hostname}${row.filepath}`
      }));
      reply.send(images);
    } catch (error) {
      console.error('Get chat images error:', error);
      reply.status(500).send({ error: 'Failed to get chat images' });
    }
  });

  // NeiroWork analysis
  app.post('/:chatId/neiro-work', async (request: FastifyRequest<{ Params: { chatId: string }; Body: AnalyzeChatRequest }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const analysisResult = await pool.query(
        'SELECT analysis_text FROM chat_analysis WHERE chat_id = $1',
        [chatId]
      );

      if (analysisResult.rows.length === 0 || !analysisResult.rows[0].analysis_text) {
        return reply.send({
          neiro_work_analysis: 'Dialog has not been analyzed yet. Please analyze the dialog first.',
          needs_analysis: true
        });
      }

      const defaultPromptResult = await pool.query(
        'SELECT prompt_text FROM ai_prompts WHERE name = $1',
        ['neiro_work']
      );

      const prompt = defaultPromptResult.rows[0]?.prompt_text || 'Default prompt';
      const fullPrompt = `${prompt}\n\nDialog Analysis: ${analysisResult.rows[0].analysis_text}`;
      const neiroWorkResponse = await getChatCompletionWithPrompt(fullPrompt, analysisResult.rows[0].analysis_text);

      reply.send({
        neiro_work_analysis: neiroWorkResponse,
        needs_analysis: false
      });
    } catch (error) {
      console.error('NeiroWork error:', error);
      reply.status(500).send({ error: 'Failed' });
    }
  });

  // Custom prompt
  app.get('/:chatId/custom-prompt', async (request: FastifyRequest<{ Params: { chatId: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const result = await pool.query('SELECT custom_prompt, use_custom_prompt FROM chats WHERE id = $1', [chatId]);
      if (result.rows.length === 0) return reply.status(404).send({ error: 'Chat not found' });
      reply.send({
        custom_prompt: result.rows[0].custom_prompt,
        use_custom_prompt: result.rows[0].use_custom_prompt
      });
    } catch (error) {
      reply.status(500).send({ error: 'Failed' });
    }
  });

  app.put('/:chatId/custom-prompt', async (request: FastifyRequest<{ Params: { chatId: string }; Body: { custom_prompt: string; use_custom_prompt?: boolean } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const { custom_prompt, use_custom_prompt } = request.body;
      const result = await pool.query(
        'UPDATE chats SET custom_prompt = $1, use_custom_prompt = $2 WHERE id = $3 RETURNING id',
        [custom_prompt, use_custom_prompt !== undefined ? use_custom_prompt : true, chatId]
      );
      if (result.rows.length === 0) return reply.status(404).send({ error: 'Chat not found' });
      reply.send({ success: true, message: 'Updated' });
    } catch (error) {
      reply.status(500).send({ error: 'Failed' });
    }
  });

  // Toggle custom prompt usage
  app.put('/:chatId/use-custom-prompt', async (request: FastifyRequest<{ Params: { chatId: string }; Body: { use_custom_prompt: boolean } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const { use_custom_prompt } = request.body;
      const result = await pool.query(
        'UPDATE chats SET use_custom_prompt = $1 WHERE id = $2 RETURNING id',
        [use_custom_prompt, chatId]
      );
      if (result.rows.length === 0) return reply.status(404).send({ error: 'Chat not found' });
      reply.send({ success: true, message: 'Updated' });
    } catch (error) {
      reply.status(500).send({ error: 'Failed' });
    }
  });

  // Update chat title
  app.put('/:chatId', async (request: FastifyRequest<{ Params: { chatId: string }; Body: { topic: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const { topic } = request.body;
      const result = await pool.query(
        'UPDATE chats SET topic = $1 WHERE id = $2 RETURNING id, topic',
        [topic, chatId]
      );
      if (result.rows.length === 0) return reply.status(404).send({ error: 'Chat not found' });
      reply.send({ success: true, chat: result.rows[0] });
    } catch (error) {
      console.error('Update chat title error:', error);
      reply.status(500).send({ error: 'Failed to update chat title' });
    }
  });

  // Test endpoint
  app.get('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await pool.query('SELECT test FROM test LIMIT 1');
      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Test data not found' });
      }
      reply.send({ test: result.rows[0].test });
    } catch (error) {
      console.error('Error fetching test data:', error);
      reply.status(500).send({ error: 'Failed to fetch test data' });
    }
  });

  // Update test data
  app.put('/test', async (request: FastifyRequest<{ Body: { test: string } }>, reply: FastifyReply) => {
    try {
      const { test } = request.body;
      // Update the first existing record
      const result = await pool.query(
        'UPDATE test SET test = $1 RETURNING test',
        [test]
      );
      reply.send({ test: result.rows[0].test });
    } catch (error) {
      console.error('Error updating test data:', error);
      reply.status(500).send({ error: 'Failed to update test data' });
    }
  });
};

export default chatRoutes;