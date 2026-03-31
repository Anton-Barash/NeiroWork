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

          // Ensure parsed content is a string or array of objects, not a primitive
          let finalContent;
          if (typeof parsedContent === 'string' || Array.isArray(parsedContent)) {
            finalContent = parsedContent;
          } else {
            // If parsed content is a primitive (number, boolean, etc.), treat as string
            finalContent = String(parsedContent);
          }

          return {
            role: row.role,
            content: finalContent
          };
        } catch {
          // If not JSON, use as string
          // Ensure content is a string, not a primitive
          let finalContent = String(row.content);
          return {
            role: row.role,
            content: finalContent
          };
        }
      });

      // Don't generate AI response during message sending
      // Instead, mark that new messages need to be analyzed

      // Check if we already have a chat analysis record
      const existingAnalysis = await pool.query(
        'SELECT id FROM chat_analysis WHERE chat_id = $1',
        [chat_id]
      );

      if (existingAnalysis.rows.length > 0) {
        // Update existing analysis to mark that it has new messages to process
        await pool.query(
          'UPDATE chat_analysis SET has_new_messages = TRUE WHERE chat_id = $1',
          [chat_id]
        );
      } else {
        // Create a new analysis record with has_new_messages = TRUE
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

      // Get chat-specific prompt settings
      const settingsResult = await pool.query(
        'SELECT dialog_analysis_prompt FROM chat_prompts_settings WHERE chat_id = $1',
        [chatId]
      );

      // Get default dialog analysis prompt
      const defaultPromptResult = await pool.query(
        'SELECT prompt_text FROM ai_prompts WHERE name = $1',
        ['dialog_analysis']
      );

      if (defaultPromptResult.rows.length === 0) {
        throw new Error('Default dialog analysis prompt not found');
      }

      // Get chat-level custom prompt
      const chatCustomPromptResult = await pool.query(
        'SELECT custom_prompt FROM chats WHERE id = $1',
        [chatId]
      );

      const defaultPrompt = defaultPromptResult.rows[0].prompt_text;
      const chatSpecificPrompt = settingsResult.rows[0]?.dialog_analysis_prompt || '';
      const chatLevelCustomPrompt = chatCustomPromptResult.rows[0]?.custom_prompt || '';

      // Combine prompts in order of priority: default -> chat-specific -> chat-level custom
      let prompt = defaultPrompt;
      if (chatSpecificPrompt) {
        prompt = chatSpecificPrompt;
      }
      if (chatLevelCustomPrompt) {
        prompt += `\n\nAdditional instructions: ${chatLevelCustomPrompt}`;
      }

      const context = messagesResult.rows.map(msg => `${msg.role}: ${msg.content}`).join('\n');

      // Get analysis from AI
      const analysis = await getChatCompletionWithPrompt(prompt, context);

      // Save the analysis to the database (update existing or insert new)
      // First try to update existing analysis
      const updateResult = await pool.query(
        'UPDATE chat_analysis SET analysis_text = $1, has_new_messages = FALSE WHERE chat_id = $2',
        [analysis, chatId]
      );

      // If no rows were updated, insert a new record
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

      // Get the existing chat analysis
      const analysisResult = await pool.query(
        'SELECT analysis_text FROM chat_analysis WHERE chat_id = $1',
        [chatId]
      );

      if (analysisResult.rows.length === 0 || !analysisResult.rows[0].analysis_text) {
        // If no analysis exists, return a message prompting the user to analyze the dialog first
        return reply.send({
          neiro_work_analysis: 'Dialog has not been analyzed yet. Please analyze the dialog first by clicking "Analyze Dialog".',
          needs_analysis: true
        });
      }

      const existingAnalysis = analysisResult.rows[0].analysis_text;

      // Get chat-specific NeiroWork prompt settings
      const settingsResult = await pool.query(
        'SELECT neirowork_prompt FROM chat_prompts_settings WHERE chat_id = $1',
        [chatId]
      );

      // Get default NeiroWork prompt
      const defaultPromptResult = await pool.query(
        'SELECT prompt_text FROM ai_prompts WHERE name = $1',
        ['neiro_work']
      );

      // Get chat-level custom prompt
      const chatCustomPromptResult = await pool.query(
        'SELECT custom_prompt FROM chats WHERE id = $1',
        [chatId]
      );

      const defaultPrompt = defaultPromptResult.rows[0]?.prompt_text || 'You are NeiroWork AI Assistant. Based on the following dialog analysis, provide strategic insights, identify key themes, highlight important decisions made, and suggest actionable next steps for the team. Focus on extracting business value from the conversation.';
      const chatSpecificPrompt = settingsResult.rows[0]?.neirowork_prompt || '';
      const chatLevelCustomPrompt = chatCustomPromptResult.rows[0]?.custom_prompt || '';

      // Combine prompts in order of priority: default -> chat-specific -> chat-level custom
      let prompt = defaultPrompt;
      if (chatSpecificPrompt) {
        prompt = chatSpecificPrompt;
      }
      if (chatLevelCustomPrompt) {
        prompt += `\n\nAdditional instructions: ${chatLevelCustomPrompt}`;
      }

      // Combine prompt with existing analysis
      const fullPrompt = `${prompt}\n\nDialog Analysis: ${existingAnalysis}`;

      const neiroWorkResponse = await getChatCompletionWithPrompt(fullPrompt, existingAnalysis);

      reply.send({
        neiro_work_analysis: neiroWorkResponse,
        needs_analysis: false
      });
    } catch (error) {
      console.error('NeiroWork analysis error:', error);
      reply.status(500).send({ error: 'Failed to perform NeiroWork analysis' });
    }
  });

  // Get custom prompt for a chat
  app.get('/:chatId/custom-prompt', async (request: FastifyRequest<{ Params: { chatId: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;

      const result = await pool.query(
        'SELECT custom_prompt FROM chats WHERE id = $1',
        [chatId]
      );

      if (result.rows.length === 0) {
        reply.status(404).send({ error: 'Chat not found' });
        return;
      }

      reply.send({ custom_prompt: result.rows[0].custom_prompt });
    } catch (error) {
      console.error('Get custom prompt error:', error);
      reply.status(500).send({ error: 'Failed to get custom prompt' });
    }
  });

  // Update custom prompt for a chat
  app.put('/:chatId/custom-prompt', async (request: FastifyRequest<{ Params: { chatId: string }; Body: { custom_prompt: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      const { custom_prompt } = request.body;

      const result = await pool.query(
        'UPDATE chats SET custom_prompt = $1 WHERE id = $2 RETURNING id',
        [custom_prompt, chatId]
      );

      if (result.rows.length === 0) {
        reply.status(404).send({ error: 'Chat not found' });
        return;
      }

      reply.send({ success: true, message: 'Custom prompt updated successfully' });
    } catch (error) {
      console.error('Update custom prompt error:', error);
      reply.status(500).send({ error: 'Failed to update custom prompt' });
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