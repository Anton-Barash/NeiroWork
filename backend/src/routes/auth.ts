import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface LoginRequest {
    username: string;
    password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authRoutes = async (app: FastifyInstance) => {
    // Check authentication status
    app.get('/check', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');
            const lastCompanyId = request.headers['x-last-company-id'];

            if (!token) {
                return reply.send({ authenticated: false });
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;

                // Get user details
                const userResult = await pool.query(
                    'SELECT id, username, email FROM users WHERE id = $1',
                    [decoded.userId]
                );

                if (userResult.rows.length === 0) {
                    return reply.send({ authenticated: false });
                }

                // Get all companies for the user from user_companies table
                const companiesResult = await pool.query(`
                    SELECT c.id, c.name, c.description
                    FROM companies c
                    INNER JOIN user_companies uc ON c.id = uc.company_id
                    WHERE uc.user_id = $1
                    ORDER BY c.id
                `, [decoded.userId]);

                // Use lastCompanyId if provided and exists in user's companies
                let company = null;
                if (lastCompanyId && companiesResult.rows.length > 0) {
                    company = companiesResult.rows.find(c => c.id == lastCompanyId);
                }

                // If no valid lastCompanyId, use first company
                if (!company && companiesResult.rows.length > 0) {
                    company = companiesResult.rows[0];
                }

                reply.send({
                    authenticated: true,
                    user: userResult.rows[0],
                    company: company,
                    companies: companiesResult.rows
                });
            } catch (error) {
                console.error('Token verification failed:', error);
                reply.send({ authenticated: false });
            }
        } catch (error) {
            console.error('Auth check error:', error);
            reply.status(500).send({ error: 'Failed to check authentication' });
        }
    });

    // Login
    app.post('/login', async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
        try {
            const { username, password } = request.body;

            if (!username || !password) {
                return reply.status(400).send({ error: 'Username and password are required' });
            }

            // Find user
            const userResult = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            if (userResult.rows.length === 0) {
                return reply.status(401).send({ error: 'Invalid username or password' });
            }

            const user = userResult.rows[0];

            // Verify password (for now, just compare directly since we're not using bcrypt)
            if (user.password !== password) {
                return reply.status(401).send({ error: 'Invalid username or password' });
            }

            // Get default company
            const companyResult = await pool.query(
                'SELECT c.id, c.name, c.description FROM companies c LIMIT 1',
                []
            );

            // Create JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            reply.send({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                company: companyResult.rows[0] || null
            });
        } catch (error) {
            console.error('Login error:', error);
            reply.status(500).send({ error: 'Login failed' });
        }
    });

    // Logout
    app.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const token = request.headers.authorization?.replace('Bearer ', '');

            // For session-based auth, we would clear the session here
            // For JWT-based auth, the client just needs to remove the token
            reply.send({ success: true });
        } catch (error) {
            console.error('Logout error:', error);
            reply.status(500).send({ error: 'Logout failed' });
        }
    });
};

export default authRoutes;