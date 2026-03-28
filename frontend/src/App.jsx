import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newChatTopic, setNewChatTopic] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch messages when current chat changes
  useEffect(() => {
    if (currentChat) {
      fetchMessages();
      fetchFiles();
    }
  }, [currentChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat/list');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentChat) return;
    try {
      const response = await axios.get(`/api/chat/${currentChat.id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFiles = async () => {
    if (!currentChat) return;
    try {
      const response = await axios.get(`/api/files/${currentChat.id}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const createChat = async () => {
    if (!newChatTopic.trim()) return;
    try {
      const response = await axios.post('/api/chat/create', {
        topic: newChatTopic,
      });
      setChats([response.data, ...chats]);
      setCurrentChat(response.data);
      setShowModal(false);
      setNewChatTopic('');
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChat || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/chat/send', {
        chat_id: currentChat.id,
        content: newMessage,
      });

      setMessages([
        ...messages,
        response.data.userMessage,
        response.data.aiMessage,
      ]);
      setNewMessage('');
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async () => {
    if (!currentChat) return;
    try {
      await axios.delete(`/api/chat/${currentChat.id}`);
      setChats(chats.filter((chat) => chat.id !== currentChat.id));
      setCurrentChat(null);
      setMessages([]);
      setFiles([]);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleFileUpload = async (e) => {
    if (!currentChat || !e.target.files) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/files/upload', formData, {
        params: { chat_id: currentChat.id },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFiles([response.data, ...files]);
      setUploadedFiles([...uploadedFiles, response.data]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await axios.delete(`/api/files/${fileId}`);
      setFiles(files.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="app" >
      {/* Sidebar */}
      < div className="sidebar" >
        <div className="sidebar-header" >
          <h1>NeiroWork </h1>
          < button className="new-chat-btn" onClick={() => setShowModal(true)
          }>
            + New Chat
          </button>
        </div>
        < div className="chat-list" >
          {
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => setCurrentChat(chat)}
              >
                <h3>{chat.topic} </h3>
                <p>
                  {' '}
                  {messages.filter((m) => m.id === chat.id).length} messages{' '}
                </p>
                < small > {new Date(chat.created_at).toLocaleDateString()} </small>
              </div>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" >
        {
          currentChat ? (
            <>
              {/* Chat Header */}
              < div className="chat-header" >
                <h2>{currentChat.topic} </h2>
                < button className="delete-chat-btn" onClick={deleteChat} >
                  Delete Chat
                </button>
              </div>

              {/* Messages */}
              <div className="messages-container" >
                {
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}
                    >
                      <div className="message-content" > {message.content} </div>
                      < div className="message-time" >
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  ))}
                {
                  isLoading && (
                    <div className="loading" >
                      <div className="loading-text" > Thinking...</div>
                    </div>
                  )
                }
                <div ref={messagesEndRef} />
              </div>

              {/* Files List */}
              {
                files.length > 0 && (
                  <div className="files-list" >
                    <h3>Files </h3>
                    {
                      files.map((file) => (
                        <div key={file.id} className="file-item" >
                          <span className="file-name" > {file.filename} </span>
                          < span className="file-size" >
                            {' '}
                            {formatFileSize(file.size)
                            } {' '}
                          </span>
                          < button
                            className="remove-file"
                            onClick={() => deleteFile(file.id)
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                )}

              {/* Input Area */}
              <div className="input-area" >
                <div className="file-upload-area" >
                  {
                    uploadedFiles.map((file) => (
                      <div key={file.id} className="file-item" >
                        <span className="file-name" > {file.filename} </span>
                        < span className="file-size" >
                          {' '}
                          {formatFileSize(file.size)
                          }{' '}
                        </span>
                      </div>
                    ))}
                  <label className="upload-btn" >
                    Upload File
                    < input
                      type="file"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div >
                < div className="input-container" >
                  <textarea
                    className="message-input"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && !e.shiftKey && sendMessage()
                    }
                  />
                  < button
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isLoading}
                  >
                    ↵
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state" >
              <h2>Welcome to NeiroWork </h2>
              < p > Create a new chat to get started </p>
              < button className="new-chat-btn" onClick={() => setShowModal(true)}>
                + New Chat
              </button>
            </div>
          )}
      </div>

      {/* Create Chat Modal */}
      {
        showModal && (
          <div className="create-chat-modal" >
            <div className="modal-content" >
              <h2>Create New Chat </h2>
              < input
                type="text"
                placeholder="Enter chat topic"
                value={newChatTopic}
                onChange={(e) => setNewChatTopic(e.target.value)
                }
                onKeyPress={(e) => e.key === 'Enter' && createChat()}
              />
              < div className="modal-buttons" >
                <button
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                < button className="confirm-btn" onClick={createChat} >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default App;