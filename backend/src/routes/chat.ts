// d:\neiroQC\NeiroWork\backend\src\routes\chat.ts
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
  app.post('/send', async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    try {
      const { chat_id, content, parent_id, images } = request.body;

      // Prepare message content
      let messageContent: string | Array<{ type: string, text?: string, image_url?: { url: string } }>;

      if (images && images.length > 0) {
        // Create content array with text and images
        messageContent = [];
        if (content && content.trim()) {
          messageContent.push({ type: 'text', text: content });
        }
        // Add images
        for (const image of images) {
          messageContent.push({
            type: 'image_url',
            image_url: { url: image.url }
          });
        }
      } else {
        // Just text content
        messageContent = content;
      }

      // Save user message as string (store images as JSON)
      const storedContent = typeof messageContent === 'string'
        ? messageContent
        : JSON.stringify(messageContent);

      // Save user message
      const userMessageResult = await pool.query(
        'INSERT INTO messages (chat_id, parent_id, content, role) VALUES ($1, $2, $3, $4) RETURNING id, parent_id, content, role, created_at',
        [chat_id, parent_id, storedContent, 'user']
      );

      // Get chat history
      const historyResult = await pool.query(
        'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
        [chat_id]
      );
      const messages = historyResult.rows.map(row => {
        try {
          // Try to parse JSON content (for messages with images)
          const parsedContent = JSON.parse(row.content);
          return {
            role: row.role,
            content: parsedContent
          };
        } catch {
          // If not JSON, use as string
          return {
            role: row.role,
            content: row.content
          };
        }
      });

      // Get AI response
      const aiResponse = await getChatCompletion(messages);

      // Save AI message
      const aiMessageResult = await pool.query(
        'INSERT INTO messages (chat_id, parent_id, content, role) VALUES ($1, $2, $3, $4) RETURNING id, parent_id, content, role, created_at',
        [chat_id, userMessageResult.rows[0].id, aiResponse, 'assistant']
      );

      // Mark chat analysis as having new messages
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

  // Analyze chat
  app.post('/:chatId/analyze', async (request: FastifyRequest<{ Params: { chatId: string }; Body: AnalyzeChatRequest }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;

      // Check if we already have a non-expired analysis
      const existingAnalysisResult = await pool.query(
        'SELECT id, analysis_text FROM chat_analysis WHERE chat_id = $1 AND has_new_messages = FALSE',
        [chatId]
      );

      if (existingAnalysisResult.rows.length > 0) {
        // Return existing analysis
        reply.send({ analysis: existingAnalysisResult.rows[0].analysis_text });
        return;
      }

      // Get all messages for this chat
      const messagesResult = await pool.query(
        'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
        [chatId]
      );

      if (messagesResult.rows.length === 0) {
        reply.send({ analysis: 'No messages to analyze.' });
        return;
      }

      // Get the dialog analysis prompt
      const promptResult = await pool.query(
        'SELECT prompt_text FROM ai_prompts WHERE name = $1',
        ['dialog_analysis']
      );

      if (promptResult.rows.length === 0) {
        throw new Error('Dialog analysis prompt not found');
      }

      const prompt = promptResult.rows[0].prompt_text;
      const context = messagesResult.rows.map(msg => `${msg.role}: ${msg.content}`).join('\n');

      // Get analysis from AI
      const analysis = await getChatCompletionWithPrompt(prompt, context);

      // Save the analysis to the database
      await pool.query(`
        INSERT INTO chat_analysis (chat_id, analysis_text, has_new_messages) 
        VALUES ($1, $2, FALSE)
      `, [chatId, analysis]);

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

      // Add full URL to each image
      const images = result.rows.map(row => ({
        ...row,
        url: `${request.protocol}://${request.hostname}:${request.port}${row.filepath}`
      }));

      reply.send(images);
    } catch (error) {
      console.error('Get chat images error:', error);
      reply.status(500).send({ error: 'Failed to get chat images' });
    }
  });

  // Get NeiroWork analysis
  app.post('/:chatId/neiro-work', async (request: FastifyRequest<{ Params: { chatId: string }; Body: AnalyzeChatRequest }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;

      // First, ensure we have an analysis
      let analysis = '';

      // Check if we already have a non-expired analysis
      const existingAnalysisResult = await pool.query(
        'SELECT analysis_text FROM chat_analysis WHERE chat_id = $1 AND has_new_messages = FALSE',
        [chatId]
      );

      if (existingAnalysisResult.rows.length > 0) {
        analysis = existingAnalysisResult.rows[0].analysis_text;
      } else {
        // If no existing analysis, trigger analysis first
        const analyzeResponse = await app.inject({
          method: 'POST',
          url: `/api/chat/${chatId}/analyze`,
          payload: { chat_id: parseInt(chatId) }
        });

        const analyzeData = JSON.parse(analyzeResponse.payload);
        analysis = analyzeData.analysis || '';
      }

      if (!analysis || analysis === 'No messages to analyze.') {
        reply.send({
          summary: 'No analysis available.',
          problems: [],
          todo: [],
          recommendations: []
        });
        return;
      }

      // Get the NeiroWork prompt
      const promptResult = await pool.query(
        'SELECT prompt_text FROM ai_prompts WHERE name = $1',
        ['neiro_work']
      );

      if (promptResult.rows.length === 0) {
        throw new Error('NeiroWork prompt not found');
      }

      const prompt = promptResult.rows[0].prompt_text;
      const neiroWorkResponse = await getChatCompletionWithPrompt(prompt, analysis);

      // Parse the response into structured data
      const parsedResponse = parseNeiroWorkResponse(neiroWorkResponse);

      reply.send(parsedResponse);
    } catch (error) {
      console.error('NeiroWork analysis error:', error);
      reply.status(500).send({ error: 'Failed to get NeiroWork analysis' });
    }
  });
};

// Helper function to parse NeiroWork response
function parseNeiroWorkResponse(response: string) {
  const lines = response.split('\n');
  let currentSection = '';
  const result = {
    summary: '',
    problems: [] as string[],
    todo: [] as string[],
    recommendations: [] as string[]
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.includes('Главные выводы') || trimmedLine.includes('1.')) {
      currentSection = 'summary';
    } else if (trimmedLine.includes('Проблемы') || trimmedLine.includes('2.')) {
      currentSection = 'problems';
    } else if (trimmedLine.includes('Чек-лист') || trimmedLine.includes('3.')) {
      currentSection = 'todo';
    } else if (trimmedLine.includes('Рекомендации') || trimmedLine.includes('4.')) {
      currentSection = 'recommendations';
    } else if (trimmedLine.startsWith('- ') || trimmedLine.match(/^\d+\.\s/)) {
      if (currentSection === 'summary' && !result.summary) {
        result.summary = trimmedLine.replace(/^- /, '').replace(/^\d+\.\s/, '');
      } else if (currentSection === 'problems') {
        result.problems.push(trimmedLine.replace(/^- /, '').replace(/^\d+\.\s/, ''));
      } else if (currentSection === 'todo') {
        result.todo.push(trimmedLine.replace(/^- /, '').replace(/^\d+\.\s/, ''));
      } else if (currentSection === 'recommendations') {
        result.recommendations.push(trimmedLine.replace(/^- /, '').replace(/^\d+\.\s/, ''));
      }
    }
  }

  return result;
}

export default chatRoutes;