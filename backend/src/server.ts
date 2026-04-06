import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import chatRoutes from './routes/chat';
import fileRoutes from './routes/files';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';


// Load environment variables
dotenv.config();

const app = fastify({
  logger: {
    level: 'error'
  }
});

// Middleware
app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve static files from uploads directory
app.register(staticPlugin, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/'
});

// Routes
app.register(chatRoutes, { prefix: '/api/chat' });
app.register(fileRoutes, { prefix: '/api/files' });
app.register(authRoutes, { prefix: '/api/auth' });
app.register(userRoutes, { prefix: '/api' });


// Import prompts routes
import promptRoutes from './routes/prompts';
app.register(promptRoutes, { prefix: '/api/prompts' });

// Health check
app.get('/api/health', async (request, reply) => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    await app.listen({ port: parseInt(process.env.PORT || '3001'), host: '0.0.0.0' });
    console.log(`Server running on port ${process.env.PORT || '3001'}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();