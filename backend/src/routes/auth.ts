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
            console.log('Auth check attempt:', { token: token ? 'present' : 'missing' });

            if (!token) {
                console.log('Auth check failed: No token provided');
                return reply.send({ authenticated: false });
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                console.log('Auth check: Token decoded successfully', { userId: decoded.userId, username: decoded.username });

                // Get user details
                const userResult = await pool.query(
                    'SELECT id, username, email FROM users WHERE id = $1',
                    [decoded.userId]
                );

                if (userResult.rows.length === 0) {
                    console.log('Auth check failed: User not found', { userId: decoded.userId });
                    return reply.send({ authenticated: false });
                }

                // Get default company for user
                const companyResult = await pool.query(
                    'SELECT c.id, c.name, c.description FROM companies c LIMIT 1',
                    []
                );

                console.log('Auth check successful:', { userId: userResult.rows[0].id, username: userResult.rows[0].username });
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
            console.log('Login attempt:', { username });

            if (!username || !password) {
                console.log('Login failed: Missing username or password', { username: username ? username : 'missing', password: password ? 'provided' : 'missing' });
                return reply.status(400).send({ error: 'Username and password are required' });
            }

            // Find user
            const userResult = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            if (userResult.rows.length === 0) {
                console.log('Login failed: User not found', { username });
                return reply.status(401).send({ error: 'Invalid username or password' });
            }

            const user = userResult.rows[0];

            // Verify password (for now, just compare directly since we're not using bcrypt)
            if (user.password !== password) {
                console.log('Login failed: Invalid password', { username });
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

            console.log('Login successful:', { userId: user.id, username: user.username });
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
            console.log('Logout attempt:', { token: token ? 'present' : 'missing' });

            // For session-based auth, we would clear the session here
            // For JWT-based auth, the client just needs to remove the token
            console.log('Logout successful');
            reply.send({ success: true });
        } catch (error) {
            console.error('Logout error:', error);
            reply.status(500).send({ error: 'Logout failed' });
        }
    });
};

export default authRoutes;