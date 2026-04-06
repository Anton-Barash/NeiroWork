// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'  // ✅ Должен остаться
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ChatProvider>  {/* ✅ Должен остаться для компонентов */}
        <App />
      </ChatProvider>
    </AuthProvider>
  </React.StrictMode>,
)