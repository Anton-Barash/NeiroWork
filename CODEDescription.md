# NeiroWork Project - Code Structure Documentation

## Project Overview
NeiroWork is a chat application with AI-powered analysis capabilities. It allows users to create chats, send messages, analyze dialogs using AI, and get strategic insights through NeiroWork.

---

## Project Structure

```
NeiroWork/
├── backend/              # Fastify/Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts    # PostgreSQL connection and table creation
│   │   │   └── doubao.ts    # Doubao AI API integration
│   │   ├── routes/
│   │   │   ├── chat.ts      # Chat API routes
│   │   │   └── files.ts    # File upload routes
│   │   └── server.ts      # Main server entry point
│   ├── package.json
│   └── .env             # Environment variables
│
├── frontend/           # React/Vite frontend
│   ├── src/
│   │   ├── components/     # UI компоненты
│   │   │   ├── ChatList.jsx        # Список чатов в сайдбаре
│   │   │   ├── ChatWindow.jsx       # Основное окно чата
│   │   │   ├── MessageInput.jsx     # Поле ввода сообщения
│   │   │   ├── AnalysisPanel.jsx   # Панель анализа диалога
│   │   │   ├── NeiroWorkPanel.jsx  # Панель NeiroWork
│   │   │   └── modals/
│   │   │       ├── CreateChatModal.jsx      # Модальное окно создания чата
│   │   │       ├── PromptSettingsModal.jsx   # Настройки кастомного промта
│   │   │       └── AdvancedSettingsModal.jsx   # Расширенные настройки промтов
│   │   ├── hooks/       # Custom React hooks
│   │   │   ├── useChats.js        # Работа с чатами (CRUD операции)
│   │   │   ├── useMessages.js      # Работа с сообщениями
│   │   │   └── useAnalysis.js      # Работа с анализом
│   │   ├── services/  # API сервисы
│   │   │   └── api.js           # axios API вызовы
│   │   ├── context/  # React Context
│   │   │   └── ChatContext.jsx   # Глобальное состояние чата
│   │   ├── App.jsx   # Главный компонент (сборка)
│   │   ├── App.styles.js # Styled components
│   │   ├── index.css    # Глобальные стили
│   │   └── main.tsx   # Точка входа
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── package.json      # Root package.json (optional)
```

---

## Backend Structure

### 1. server.ts - Main Server Entry Point
- **Purpose**: Initializes Fastify server, registers plugins and routes
- **Key Components**:
  - `fastify()` - Creates Fastify instance with logging
  - `@fastify/cors` - CORS middleware
  - `@fastify/multipart` - File upload support (5MB limit)
  - `@fastify/static` - Serves uploads directory
  - `chatRoutes` - Chat API routes (prefix: `/api/chat`)
  - `fileRoutes` - File API routes (prefix: `/api/files`)
  - Database connection via `connectDB()`
- **Port**: 3001 (or from `process.env.PORT`)
- **Health Check**: `GET /api/health`

### 2. database.ts - Database Configuration
- **Purpose**: PostgreSQL connection and schema initialization
- **Key Functions**:
  - `connectDB()` - Creates connection pool and calls `createTables()`
  - `createTables()` - Creates all required tables
- **Tables Created**:
  1. `chats` - Chat sessions
     - `id` (SERIAL PRIMARY KEY)
     - `topic` (VARCHAR 255)
     - `custom_prompt` (TEXT) - Custom prompt for AI analysis
     - `created_at` (TIMESTAMP)
  2. `messages` - Chat messages
     - `id` (SERIAL PRIMARY KEY)
     - `chat_id` (INTEGER REFERENCES chats)
     - `parent_id` (INTEGER REFERENCES messages)
     - `content` (TEXT)
     - `role` (VARCHAR 50) - "user" or "assistant"
     - `created_at` (TIMESTAMP)
  3. `files` - Uploaded files
     - `id` (SERIAL PRIMARY KEY)
     - `chat_id` (INTEGER REFERENCES chats)
     - `filename` (VARCHAR 255)
     - `filepath` (VARCHAR 255)
     - `size` (INTEGER)
     - `type` (VARCHAR 100)
     - `created_at` (TIMESTAMP)
  4. `chat_analysis` - Dialog analysis results
     - `id` (SERIAL PRIMARY KEY)
     - `chat_id` (INTEGER REFERENCES chats)
     - `analysis_text` (TEXT) - Analysis result from AI
     - `created_at` (TIMESTAMP)
     - `has_new_messages` (BOOLEAN) - Flag for new messages
  5. `ai_prompts` - AI prompts storage
     - `id` (SERIAL PRIMARY KEY)
     - `name` (VARCHAR 255 UNIQUE) - Prompt name
     - `prompt_text` (TEXT) - Prompt content
     - `version` (INTEGER)
     - `created_at`, `updated_at` (TIMESTAMP)
  6. `chat_prompts_settings` - Chat-specific prompt overrides
     - `id` (SERIAL PRIMARY KEY)
     - `chat_id` (INTEGER REFERENCES chats)
     - `dialog_analysis_prompt` (TEXT) - Custom dialog analysis prompt
     - `neirowork_prompt` (TEXT) - Custom NeiroWork prompt
     - `created_at`, `updated_at` (TIMESTAMP)

### 3. doubao.ts - AI API Integration
- **Purpose**: Integrates with Doubao (likely OpenAI-compatible) API
- **Key Function**:
  - `getChatCompletionWithPrompt(prompt, context)` - Sends prompt + context to AI and returns response

### 4. chat.ts - Chat API Routes
- **Prefix**: `/api/chat`
- **Routes**:
  | Method | Endpoint | Description |
  |-------|---------|------------|
  | GET | `/list` | Get all chats |
  | POST | `/create` | Create new chat |
  | GET | `/:chatId/messages` | Get chat messages |
  | POST | `/:chatId/send` | Send message |
  | DELETE | `/:chatId` | Delete chat |
  | GET | `/:chatId/analysis` | Get chat analysis |
  | POST | `/:chatId/analyze` | Analyze dialog (calls AI) |
  | GET | `/:chatId/images` | Get chat images |
  | POST | `/:chatId/neiro-work` | Get NeiroWork analysis |
  | GET | `/:chatId/custom-prompt` | Get custom prompt |
  | PUT | `/:chatId/custom-prompt` | Update custom prompt |
  | GET | `/:chatId/prompt-settings` | Get chat prompt settings |
  | PUT | `/:chatId/prompt-settings` | Update chat prompt settings |

- **Three-Level Prompt System**:
  1. **System Level**: Default prompts from `ai_prompts` table (names: `dialog_analysis`, `neiro_work`)
  2. **Chat-Specific Level**: Custom prompts from `chat_prompts_settings` table
  3. **Additional Instructions**: User-defined additional instructions from `chats.custom_prompt`
- **Prompt Priority**: Chat-specific > Additional instructions > System default

### 5. files.ts - File API Routes
- **Prefix**: `/api/files`
- **Routes**:
  | Method | Endpoint | Description |
  |-------|---------|------------|
  | POST | `/upload` | Upload file to chat |
  | GET | `/:chatId` | Get files for chat |
  | DELETE | `/:fileId` | Delete file |

---

## Frontend Structure (New Modular)

### Directory: frontend/src/

```
frontend/src/
├── components/     # UI компоненты
│   ├── ChatList.jsx        # Список чатов в сайдбаре
│   ├── ChatWindow.jsx       # Основное окно чата
│   ├── MessageInput.jsx     # Поле ввода сообщения
│   ├── AnalysisPanel.jsx   # Панель анализа диалога
│   ├── NeiroWorkPanel.jsx  # Панель NeiroWork
│   └── modals/
│   │       ├── CreateChatModal.jsx      # Модальное окно создания чата
│   │       ├── PromptSettingsModal.jsx   # Настройки кастомного промта
│   │       └── AdvancedSettingsModal.jsx   # Расширенные настройки промтов
├── hooks/       # Custom React hooks
│   ├── useChats.js        # Работа с чатами (CRUD операции)
│   ├── useMessages.js      # Работа с сообщениями
│   └── useAnalysis.js      # Работа с анализом
├── services/  # API сервисы
│   └── api.js           # axios API вызовы
├── context/  # React Context
│   └── ChatContext.jsx   # Глобальное состояние чата
├── App.jsx   # Главный компонент (сборка)
├── App.styles.js # Styled components
├── index.css    # Глобальные стили
└── main.tsx   # Точка входа
```

### Концепция модульной структуры:
- **components/** - чистые UI компоненты (presentation)
- **hooks/** - бизнес-логика ( состояние и副作用)
- **services/** - работа с API ( data layer)
- **context/** - глобальное состояние ( state management)

---

### 1. services/api.js - API Сервис
- **Purpose**: Все axios API вызовы в одном месте
- **Key Functions**:
  ```javascript
  // Chats
  getChats() → GET /api/chat/list
  createChat(topic) → POST /api/chat/create
  deleteChat(chatId) → DELETE /api/chat/:chatId
  getCustomPrompt(chatId) → GET /api/chat/:chatId/custom-prompt
  updateCustomPrompt(chatId, prompt) → PUT /api/chat/:chatId/custom-prompt
  getPromptSettings(chatId) → GET /api/chat/:chatId/prompt-settings
  updatePromptSettings(chatId, settings) → PUT /api/chat/:chatId/prompt-settings

  // Messages
  getMessages(chatId) → GET /api/chat/:chatId/messages
  sendMessage(chatId, content, images) → POST /api/chat/:chatId/send

  // Analysis
  getAnalysis(chatId) → GET /api/chat/:chatId/analysis
  analyzeChat(chatId) → POST /api/chat/:chatId/analyze
  getNeiroWorkAnalysis(chatId) → POST /api/chat/:chatId/neiro-work

  // Files
  getFiles(chatId) → GET /api/files/:chatId
  uploadFile(formData, chatId) → POST /api/files/upload
  deleteFile(fileId) → DELETE /api/files/:fileId
  ```

### 2. hooks/useChats.js - Chats Hook
- **Purpose**: Управление чатами (CRUD)
- **State**:
  ```javascript
  chats          // Все чаты
  currentChat   // Текущий выбранный чат
  isLoading  // Загрузка
  ```
- **Functions**:
  ```javascript
  fetchChats()           // Загрузить все чаты
  createChat(topic)      // Создать чат
  deleteChat(chatId)    // Удалить чат
  selectChat(chat)       // Выбрать чат
  clearCurrentChat()     // Очистить выбор
  ```

### 3. hooks/useMessages.js - Messages Hook
- **Purpose**: Управление сообщениями
- **State**:
  ```javascript
  messages         // ��ообщения текущего чата
  newMessage     // Текст нового сообщения
  isSending    // Отправка сообщения
  uploadedFiles   // Загруженные файлы
  uploadedImages // Загруженные изображения
  ```
- **Functions**:
  ```javascript
  fetchMessages(chatId)        // Загрузить сообщения
  sendMessage()              // Отправить сообщение
  handleFileUpload(file)     // Загрузить файл
  handleImageUpload(file)   // Загрузить изображение
  removeImage(imageId)       // Удалить изображение
  clearMessages()         // Очистить сообщения
  ```

### 4. hooks/useAnalysis.js - Analysis Hook
- **Purpose**: Управление анализом
- **State**:
  ```javascript
  analysis              // Текущий анализ
  showAnalysis        // Показать панель анализа
  analysisLoading   // Загрузка анализа
  customPrompt     // Кастомный промт
  promptSettings // Настройки промтов
  ```
- **Functions**:
  ```javascript
  fetchAnalysis(chatId)           // Загрузить анализ
  analyzeChat()                  // Запустить анализ
  fetchCustomPrompt(chatId)       // Загрузить кастомный промт
  updateCustomPrompt(prompt)        // Обновить кастомный промт
  fetchPromptSettings(chatId)     // Загрузить настройки промтов
  updatePromptSettings(settings)  // Обновить настройки промтов
  ```

### 5. context/ChatContext.jsx - Global State
- **Purpose**: Глобальное состояние для всего приложения
- **Provides**:
  ```javascript
  // Все состояния и функции из hooks
  // Объединены в один контекст
  chats, currentChat, messages, analysis...
  fetchChats, createChat, sendMessage...
  ```
- **Usage**:
  ```javascript
  const { chats, currentChat, sendMessage } = useChatContext()
  ```

### 6. components/ChatList.jsx - Chat List
- **Purpose**: Отображение списка чатов в сайдбаре
- **Props**: None (использует context)
- **Renders**:
  - ChatItem для каждого чата
  - NewChatButton

### 7. components/ChatWindow.jsx - Chat Window
- **Purpose**: Основное окно чата
- **Props**: None (использует context)
- **Renders**:
  - ChatHeader
  - MessagesContainer
  - InputArea
  - AnalysisPanel (conditional)
  - NeiroWorkPanel (conditional)

### 8. components/MessageInput.jsx - Input
- **Purpose**: Поле ввода сообщения
- **Props**: None (использует context)
- **Features**:
  - Text input
  - Image upload button
  - Send button
  - Pending images preview

### 9. components/AnalysisPanel.jsx - Analysis Panel
- **Purpose**: Панель анализа диалога
- **Props**: None (использует context)
- **Displays**:
  - Analysis content (ReactMarkdown)
  - Close button

### 10. components/NeiroWorkPanel.jsx - NeiroWork Panel
- **Purpose**: Панель NeiroWork
- **Props**: None (использует context)
- **Displays**:
  - Summary section
  - Problems section
  - Todo section
  - Recommendations section

### 11. modals/CreateChatModal.jsx - Create Chat Modal
- **Purpose**: Модальное окно создания чата
- **Props**: None (использует context)
- **Elements**:
  - Topic input
  - Create button
  - Cancel button

### 12. modals/PromptSettingsModal.jsx - Custom Prompt Modal
- **Purpose**: Простые настройки промта
- **Props**: None (использует context)
- **Elements**:
  - Textarea for custom prompt
  - Save/Cancel buttons

### 13. modals/AdvancedSettingsModal.jsx - Advanced Settings
- **Purpose**: Расширенные настройки промтов
- **Props**: None (использует context)
- **Elements**:
  - Dialog analysis prompt textarea
  - NeiroWork prompt textarea
  - Save/Cancel buttons

### 14. App.jsx - Главный компонент
- **Purpose**: Сборка всего приложения
- **Structure**:
  ```javascript
  // Imports
  import { ChatProvider } from './context/ChatContext'
  import ChatList from './components/ChatList'
  import ChatWindow from './components/ChatWindow'
  import CreateChatModal from './components/modals/CreateChatModal'
  import PromptSettingsModal from './components/modals/PromptSettingsModal'
  import AdvancedSettingsModal from './components/modals/AdvancedSettingsModal'

  // App component
  function App() {
    return (
      <ChatProvider>
        <S.AppContainer>
          <ChatList />
          <ChatWindow />
          <CreateChatModal />
          <PromptSettingsModal />
          <AdvancedSettingsModal />
        </S.AppContainer>
      </ChatProvider>
    )
  }
  ```

### 15. App.styles.js - Стили
- **Purpose**: Все styled components (можно тоже разделить)
- **Option**: Разделить на:
  - styles/components.js - стили компонентов
  - styles/modals.js - стили модальных окон
  - styles/layout.js - стили layout

---

## Old Structure (for reference)
- **Purpose**: Main UI component for chat interface
- **State Variables**:
  ```javascript
  chats            // Array of all chats
  currentChat     // Currently selected chat
  messages       // Messages in current chat
  files          // Files in current chat
  newMessage    // Input message text
  isLoading     // Loading state for sending
  showModal     // Create chat modal visibility
  newChatTopic  // New chat topic input
  uploadedFiles // Files pending to send
  uploadedImages // Images pending to send
  analysis      // Current chat analysis
  showAnalysis  // Analysis panel visibility
  showNeiroWork        // NeiroWork panel visibility
  showNeiroWorkWindow   // NeiroWork overview window visibility
  allAnalyses           // All chats analyses
  analysesLoading      // Loading state for analyses
  analysisLoading     // Loading state for analysis
  neiroWorkLoading // Loading state for NeiroWork
  customPrompt         // Custom prompt for chat
  showCustomPromptSettings // Custom prompt modal visibility
  promptSettings      // Dialog/NeiroWork prompt settings
  showAdvancedPromptSettings // Advanced settings modal visibility
  ```

- **Key Functions**:
  ```javascript
  // Data fetching
  fetchChats()        // Fetch all chats
  fetchMessages()      // Fetch messages for current chat
  fetchFiles()        // Fetch files for current chat
  fetchImages()       // Fetch images for current chat
  fetchAnalysis()     // Fetch analysis for current chat
  fetchCustomPrompt() // Fetch custom prompt for current chat
  fetchPromptSettings() // Fetch prompt settings for current chat
  fetchAllAnalyses()   // Fetch all analyses for NeiroWork overview

  // Chat operations
  createChat()       // Create new chat
  sendMessage()     // Send message to chat
  deleteChat()      // Delete chat
  analyzeChat()    // Analyze current dialog

  // File operations
  handleFileUpload()    // Upload file
  deleteFile()        // Delete file
  handleImageUpload()    // Upload image
  removeImage()        // Remove pending image

  // Prompt operations
  updateCustomPrompt()     // Update custom prompt
  updatePromptSettings()  // Update advanced prompt settings

  // Utilities
  formatTime(timestamp)    // Format message time
  formatFileSize(bytes)  // Format file size
  ```

- **UI Components** (from App.styles.js):
  ```
  AppContainer      // Main app container (flex layout)
  Sidebar         // Chat list sidebar (300px width)
  SidebarHeader   // Sidebar header with buttons
  NewChatButton // "+ New Chat" button
  ChatList       // Chat items list
  ChatItem       // Individual chat item
  MainContent   // Main content area
  ChatHeader   // Chat header with actions
  ChatTitle    // Current chat title
  HeaderButtonsContainer // Action buttons container
  AnalyzeButton // "Analyze Dialog" button
  DeleteChatButton // "Delete Chat" button
  SettingsButton // Settings (⚙️) button
  AdvancedSettingsButton // Advanced settings (🔧) button
  MessagesContainer // Messages display
  MessageBubble // Individual message
  MessageContent // Message content
  MessageTime  // Message timestamp
  InputArea    // Input area
  InputContainer // Input container
  MessageInput // Text input
  SendButton  // Send button
  FileUploadArea // File upload area
  AnalysisContainer // Analysis panel
  AnalysisHeader   // Analysis header
  AnalysisTitle  // "Dialog Analysis" title
  AnalysisContent // Analysis text (ReactMarkdown)
  NeiroWorkContainer // NeiroWork panel
  NeiroWorkHeader // NeiroWork header
  NeiroWorkContainerTitle // "NeiroWork Assistant"
  NeiroWorkContainerContent // NeiroWork content
  Section      // Section (Summary/Problems/Todo/Recommendations)
  SectionTitle // Section title
  SectionContent // Section content
  List         // Unordered list
  ListItem     // List item
  EmptyState  // Empty state when no chat selected
  EmptyTitle  // "Welcome to NeiroWork"
  EmptyText   // "Create a new chat to get started"
  CreateChatModal // Modal for creating chat
  ModalContent // Modal content
  ModalTitle   // Modal title
  ModalInput  // Text input
  ModalTextarea // Textarea
  ModalButtons // Modal buttons container
  CancelButton // Cancel button
  ConfirmButton // Confirm button
  FileUploadLabel // File upload label
  FilesListContainer // Files list
  FilesTitle // "Files" title
  FileItem // File item
  FileName // File name
  FileSize // File size
  RemoveFileButton // Remove file button
  CloseButton // Close (×) button
  LoadingText // Loading text
  ```

### 2. App.styles.js - Styled Components
- **Purpose**: All UI styling using `@emotion/styled`
- **Key Patterns**:
  - Flat buttons (NewChatButton) - no shadow, simple colors
  - 3D/elevated buttons (AppTitleButton) - box-shadow for depth
  - Hover effects with transitions
  - Modal overlays with click-to-close
  - Scrollable containers
  - Markdown styling for ReactMarkdown

### 3. index.css - Global Styles
- **Purpose**: Global CSS resets
- **Key Elements**:
  - Box-sizing: border-box
  - Body margin: 0
  - Font-family: system-ui
  - Root variables for colors

---

## API Flow

### 1. Creating a Chat
```
User clicks "+ New Chat" → Modal opens → Enter topic → 
POST /api/chat/create → Save to DB → Update state
```

### 2. Sending a Message
```
User types message → Click "Send" → POST /api/chat/send → 
Save user message → Mark as needing analysis → Update state
```


### 3. Analyzing a Dialog
```
User clicks "Analyze Dialog" → POST /api/chat/:id/analyze →
Get messages from DB → Get prompt from DB → Send to AI →
Save analysis to DB → Update state → Refresh all analyses
```


### 4. NeiroWork Analysis
```
User clicks "NeiroWork" in sidebar → Fetch all analyses → 
Display overview → User can click into any chat
```


---

## Prompt System Details

### Default Prompts (stored in ai_prompts table):
1. **dialog_analysis**: "Проанализируй этот диалог. Выпиши основные темы, проблемы, договорённости, важные факты. Ответ давать кратко, структурированно."
2. **neiro_work**: "Ты — менеджер по организации работы. На основе анализа диалога составь: 1. Главные выводы 2. Проблемы 3. Чек-лист задач 4. Рекомендации"

### Custom Prompt Levels:
1. **Simple Custom Prompt** (chats.custom_prompt):
   - Adds additional instructions to default prompt
   - Example: "Focus on technical aspects"

2. **Chat-Specific Prompts** (chat_prompts_settings):
   - dialog_analysis_prompt: Overrides default dialog analysis completely
   - neirowork_prompt: Overrides default NeiroWork completely

---

## Important Notes

### 1. Database Schema
- Each chat has ONE analysis stored in chat_analysis table
- Use UPDATE not INSERT when re-analyzing

### 2. API Routes
- Always use correct path: `/api/chat/:chatId/...`
- NO spaces in path: `/api/chat/${chatId}/messages` NOT `/ api / chat / ...`

### 3. Frontend State
- Always update state after async operations
- Use proper dependency arrays in useEffect
- Clear analysis when new messages arrive

### 4. Error Handling
- All async functions have try-catch blocks
- Console.error for debugging
- User-friendly error messages

### 5. Markdown Support
- Use ReactMarkdown for analysis display
- Supports headers, lists, code blocks, etc.


---

## Environment Variables

### Backend (.env):
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=neirowork
PORT=3001
OPENAI_API_KEY=your-api-key
```

---

## Running the Project

### Backend:
```bash
cd backend
npm install
npm run dev  # or: npx tsx src/server.ts
```


### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Default URLs:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API: http://localhost:3001/api
```


---


## Troubleshooting

### Common Issues:
1. **White screen**: Check console for errors, verify file structure
2. **API not working**: Check backend is running, check .env
3. **Analysis not showing**: Check database has analysis_text column
4. **Custom prompt not working**: Ensure custom_prompt column exists in chats table
5. **File upload failing**: Check file size limit (5MB), check multipart plugin

---

Last Updated: 2026-03-31