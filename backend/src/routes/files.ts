import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const filesRoutes = async (app: FastifyInstance) => {
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Upload file
  app.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      const chatId = request.query.chat_id as string;
      
      if (!data || !chatId) {
        return reply.status(400).send({ error: 'File and chat_id are required' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${data.filename}`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      await data.save(filepath);

      // Save file info to database
      const result = await pool.query(
        'INSERT INTO files (chat_id, filename, filepath, size, type) VALUES ($1, $2, $3, $4, $5) RETURNING id, filename, filepath, size, type, created_at',
        [chatId, data.filename, `/uploads/${filename}`, data.file?.size || 0, data.mimetype]
      );

      reply.send(result.rows[0]);
    } catch (error) {
      console.error('File upload error:', error);
      reply.status(500).send({ error: 'Failed to upload file' });
    }
  });

  // Get files for a chat
  app.get('/:chatId', async (request: FastifyRequest<{ Params: { chatId: string } }>, reply: FastifyReply) => {
    try {
      const { chatId } = request.params;
      
      const result = await pool.query(
        'SELECT id, filename, filepath, size, type, created_at FROM files WHERE chat_id = $1 ORDER BY created_at DESC',
        [chatId]
      );
      
      reply.send(result.rows);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to get files' });
    }
  });

  // Delete file
  app.delete('/:fileId', async (request: FastifyRequest<{ Params: { fileId: string } }>, reply: FastifyReply) => {
    try {
      const { fileId } = request.params;
      
      // Get file info first
      const fileResult = await pool.query(
        'SELECT filepath FROM files WHERE id = $1',
        [fileId]
      );
      
      if (fileResult.rows.length > 0) {
        const filepath = path.join(uploadDir, fileResult.rows[0].filepath.replace('/uploads/', ''));
        
        // Delete file from disk
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        
        // Delete from database
        await pool.query('DELETE FROM files WHERE id = $1', [fileId]);
      }
      
      reply.send({ success: true });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete file' });
    }
  });
};

export default filesRoutes;