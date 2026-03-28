# NeiroWork - AI Chat Application

Full-stack web application with React + Vite frontend and Fastify backend for AI-powered chat functionality.

## Features

- 🤖 AI-powered chat interface
- 💬 Multiple chat sessions
- 📁 File upload and management
- 🎨 Clean and responsive UI
- ⚡ Fast development with Vite
- 🔒 Secure backend with Fastify

## Tech Stack

### Frontend

- React 18
- Vite
- Axios for API calls
- Custom CSS styling

### Backend

- Fastify (Node.js framework)
- PostgreSQL database
- OpenAI API integration
- File upload handling

## Project Structure

```
NeiroWork/
├── frontend/          # React + Vite application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Fastify API server
│   ├── src/
│   ├── prisma/
│   └── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- OpenAI API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and OpenAI settings
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/neirowork"
OPENAI_API_KEY="your-openai-api-key"
PORT=3001
```

## Usage

1. Start the backend server on port 3001
2. Start the frontend development server on port 3000
3. Open http://localhost:3000 in your browser
4. Create a new chat and start interacting with the AI

## API Endpoints

- `GET /api/chat/list` - Get all chats
- `POST /api/chat/create` - Create new chat
- `GET /api/chat/:id/messages` - Get chat messages
- `POST /api/chat/send` - Send message to AI
- `POST /api/files/upload` - Upload file
- `GET /api/files/:chatId` - Get chat files

## Development

### Backend Commands

```bash
npm run dev          # Development server
npm run build        # Build for production
npm start           # Production server
```

### Frontend Commands

```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## License

MIT License
