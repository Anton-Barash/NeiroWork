import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import pool from '../config/database';

interface UpdatePromptRequest {
    name: string;
    prompt_text: string;
}

const promptRoutes = async (app: FastifyInstance) => {
    // Get global prompt by name
    app.get('/:name', async (request: FastifyRequest<{ Params: { name: string } }>, reply: FastifyReply) => {
        try {
            const { name } = request.params;

            const result = await pool.query(
                'SELECT name, prompt_text, version, updated_at FROM ai_prompts WHERE name = $1',
                [name]
            );

            if (result.rows.length === 0) {
                reply.status(404).send({ error: 'Prompt not found' });
                return;
            }

            reply.send(result.rows[0]);
        } catch (error) {
            console.error('Get prompt error:', error);
            reply.status(500).send({ error: 'Failed to get prompt' });
        }
    });

    // Update global prompt
    app.put('/:name', async (request: FastifyRequest<{ Params: { name: string }; Body: UpdatePromptRequest }>, reply: FastifyReply) => {
        try {
            const { name } = request.params;
            const { prompt_text } = request.body;

            const result = await pool.query(
                `UPDATE ai_prompts 
         SET prompt_text = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE name = $2 
         RETURNING name, prompt_text, version`,
                [prompt_text, name]
            );

            if (result.rows.length === 0) {
                // If prompt doesn't exist, create it
                const insertResult = await pool.query(
                    `INSERT INTO ai_prompts (name, prompt_text, version) 
           VALUES ($1, $2, 1) 
           RETURNING name, prompt_text, version`,
                    [name, prompt_text]
                );

                reply.send(insertResult.rows[0]);
                return;
            }

            reply.send(result.rows[0]);
        } catch (error) {
            console.error('Update prompt error:', error);
            reply.status(500).send({ error: 'Failed to update prompt' });
        }
    });

    // Get all global prompts
    app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await pool.query(
                'SELECT name, prompt_text, version, updated_at FROM ai_prompts ORDER BY name'
            );
            reply.send(result.rows);
        } catch (error) {
            console.error('Get all prompts error:', error);
            reply.status(500).send({ error: 'Failed to get prompts' });
        }
    });
};

export default promptRoutes;