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

                // Get default company for user
                const companyResult = await pool.query(
                    'SELECT c.id, c.name, c.description FROM companies c LIMIT 1',
                    []
                );

                reply.send({
                    authenticated: true,
                    user: userResult.rows[0],
                    company: companyResult.rows[0] || null
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