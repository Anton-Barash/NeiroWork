// frontend/src/main.jsx
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'  // ✅ Должен остаться
import './index.css'

// Lazy load the App component
const App = React.lazy(() => import('./App.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ChatProvider>  {/* ✅ Должен остаться для компонентов */}
        <Suspense fallback={<div>Loading...</div>}>
          <App />
        </Suspense>
      </ChatProvider>
    </AuthProvider>
  </React.StrictMode>,
)