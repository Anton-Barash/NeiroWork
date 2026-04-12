import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import pool from '../config/database';

interface CreateUserRequest {
    username: string;
    password: string;
    email?: string;
}

interface CreateCompanyRequest {
    name: string;
    description?: string;
}

const userRoutes = async (app: FastifyInstance) => {
    // Get all users
    app.get('/users', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await pool.query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
            reply.send(result.rows);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to get users' });
        }
    });

    // Get user by ID
    app.get('/users/:userId', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
        try {
            const { userId } = request.params;
            const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [userId]);

            if (result.rows.length === 0) {
                return reply.status(404).send({ error: 'User not found' });
            }

            reply.send(result.rows[0]);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to get user' });
        }
    });

    // Create user
    app.post('/users', async (request: FastifyRequest<{ Body: CreateUserRequest }>, reply: FastifyReply) => {
        try {
            const { username, password, email } = request.body;

            if (!username || !password) {
                return reply.status(400).send({ error: 'Username and password are required' });
            }

            const result = await pool.query(
                'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
                [username, password, email || null]
            );

            reply.send(result.rows[0]);
        } catch (error) {
            console.error('Create user error:', error);
            reply.status(500).send({ error: 'Failed to create user' });
        }
    });

    // Get all companies for current user
    app.get('/companies', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get companies from user_companies table
            const result = await pool.query(`
                SELECT c.id, c.name, c.description, c.created_at, uc.role
                FROM companies c
                INNER JOIN user_companies uc ON c.id = uc.company_id
                WHERE uc.user_id = $1
                ORDER BY c.created_at DESC
            `, [decoded.userId]);

            reply.send(result.rows);
        } catch (error) {
            console.error('Error fetching companies:', error);
            reply.status(500).send({ error: 'Failed to get companies' });
        }
    });

    // Get company by ID
    app.get('/companies/:companyId', async (request: FastifyRequest<{ Params: { companyId: string } }>, reply: FastifyReply) => {
        try {
            const { companyId } = request.params;
            const result = await pool.query('SELECT id, name, description, created_at FROM companies WHERE id = $1', [companyId]);

            if (result.rows.length === 0) {
                return reply.status(404).send({ error: 'Company not found' });
            }

            reply.send(result.rows[0]);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to get company' });
        }
    });

    // Create company with role system
    app.post('/companies', async (request: FastifyRequest<{ Body: CreateCompanyRequest }>, reply: FastifyReply) => {
        try {
            const { name, description } = request.body;

            if (!name) {
                return reply.status(400).send({ error: 'Company name is required' });
            }

            // Get current user ID from session
            const userId = 1; // TODO: Get from session

            // Generate code and unique_id
            const code = name.toUpperCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
            const unique_id = 'COMPANY_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Create company
                const companyResult = await client.query(
                    'INSERT INTO companies (name, description, code, unique_id, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, code, unique_id, created_at',
                    [name, description || null, code, unique_id, userId]
                );

                // Add creator as owner
                await client.query(
                    'INSERT INTO user_companies (user_id, company_id, role) VALUES ($1, $2, $3)',
                    [userId, companyResult.rows[0].id, 'owner']
                );

                await client.query('COMMIT');
                reply.send(companyResult.rows[0]);
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Create company error:', error);
            reply.status(500).send({ error: 'Failed to create company' });
        }
    });

    // Get chats for a specific company
    app.get('/companies/:companyId/chats', async (request: FastifyRequest<{ Params: { companyId: string } }>, reply: FastifyReply) => {
        try {
            const { companyId } = request.params;
            const result = await pool.query(
                'SELECT id, topic, created_at FROM chats WHERE company_id = $1 ORDER BY created_at DESC',
                [companyId]
            );
            reply.send(result.rows);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to get company chats' });
        }
    });

    // Join company by unique ID
    app.post('/companies/join', async (request: FastifyRequest<{ Body: { companyId: string } }>, reply: FastifyReply) => {
        try {
            const { companyId } = request.body;

            if (!companyId) {
                return reply.status(400).send({ error: 'Company unique ID is required' });
            }

            // Get current user ID from session
            const userId = 1; // TODO: Get from session

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Find company by unique_id
                const companyResult = await client.query(
                    'SELECT id, name FROM companies WHERE unique_id = $1',
                    [companyId]
                );

                if (companyResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return reply.status(404).send({ error: 'Company not found' });
                }

                const company = companyResult.rows[0];

                // Check if user is already in the company
                const existingResult = await client.query(
                    'SELECT * FROM user_companies WHERE user_id = $1 AND company_id = $2',
                    [userId, company.id]
                );

                if (existingResult.rows.length > 0) {
                    await client.query('ROLLBACK');
                    return reply.status(400).send({ error: 'User is already in this company' });
                }

                // Add user to company as member
                await client.query(
                    'INSERT INTO user_companies (user_id, company_id, role) VALUES ($1, $2, $3)',
                    [userId, company.id, 'member']
                );

                await client.query('COMMIT');
                reply.send({
                    success: true,
                    company: {
                        id: company.id,
                        name: company.name
                    }
                });
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Join company error:', error);
            reply.status(500).send({ error: 'Failed to join company' });
        }
    });
};

export default userRoutes;