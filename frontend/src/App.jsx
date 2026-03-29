// d:\neiroQC\NeiroWork\frontend\src\App.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as S from './App.styles';

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
  const [uploadedImages, setUploadedImages] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [neiroWork, setNeiroWork] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showNeiroWork, setShowNeiroWork] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [neiroWorkLoading, setNeiroWorkLoading] = useState(false);
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
      // Also fetch existing analysis if available
      fetchAnalysis();
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



  const fetchImages = async () => {
    if (!currentChat) return;
    try {
      const response = await axios.get(`/api/chat/${currentChat.id}/images`);
      // We'll use these images if needed
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const fetchAnalysis = async () => {
    if (!currentChat) return;
    try {
      const response = await axios.get(`/api/chat/${currentChat.id}/analysis`);
      if (response.data.analysis_text) {
        setAnalysis(response.data.analysis_text);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
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
    if ((!newMessage.trim() && uploadedImages.length === 0) || !currentChat || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/chat/send', {
        chat_id: currentChat.id,
        content: newMessage,
        images: uploadedImages.map(img => ({ url: img.url })),
      });

      setMessages([
        ...messages,
        response.data.userMessage,
        response.data.aiMessage,
      ]);
      setNewMessage('');
      setUploadedFiles([]);
      setUploadedImages([]);
      // Reset analysis since we have new messages
      setAnalysis(null);
      setNeiroWork(null);
      setShowAnalysis(false);
      setShowNeiroWork(false);
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
      setAnalysis(null);
      setNeiroWork(null);
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

  const handleImageUpload = async (e) => {
    if (!currentChat || !e.target.files) return;

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/files/upload', formData, {
        params: { chat_id: currentChat.id },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Create image URL for preview
      const imageUrl = `${window.location.origin}${response.data.filepath}`;
      setUploadedImages([...uploadedImages, { id: response.data.id, url: imageUrl, filename: response.data.filename }]);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const removeImage = (imageId) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
  };

  const analyzeChat = async () => {
    if (!currentChat) return;

    setAnalysisLoading(true);
    try {
      const response = await axios.post(`/api/chat/${currentChat.id}/analyze`);
      setAnalysis(response.data.analysis);
      setShowAnalysis(true);
      // Hide NeiroWork when showing analysis
      setShowNeiroWork(false);
    } catch (error) {
      console.error('Error analyzing chat:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getNeiroWork = async () => {
    if (!currentChat) return;

    setNeiroWorkLoading(true);
    try {
      const response = await axios.post(`/api/chat/${currentChat.id}/neiro-work`);
      setNeiroWork(response.data);
      setShowNeiroWork(true);
      // Hide analysis when showing NeiroWork
      setShowAnalysis(false);
    } catch (error) {
      console.error('Error getting NeiroWork:', error);
    } finally {
      setNeiroWorkLoading(false);
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
    <S.AppContainer>
      {/* Sidebar */}
      <S.Sidebar>
        <S.SidebarHeader>
          <S.AppTitle>NeiroWork</S.AppTitle>
          <S.NewChatButton onClick={() => setShowModal(true)}>
            + New Chat
          </S.NewChatButton>
        </S.SidebarHeader>
        <S.ChatList>
          {
            chats.map((chat) => (
              <S.ChatItem
                key={chat.id}
                active={currentChat?.id === chat.id}
                onClick={() => {
                  setCurrentChat(chat);
                  setShowAnalysis(false);
                  setShowNeiroWork(false);
                }}
              >
                <h3>{chat.topic}</h3>
                <p>
                  {messages.filter((m) => m.id === chat.id).length} messages
                </p>
                <small>{new Date(chat.created_at).toLocaleDateString()}</small>
              </S.ChatItem>
            ))
          }
        </S.ChatList>
      </S.Sidebar>

      {/* Main Content */}
      <S.MainContent>
        {
          currentChat ? (
            <>
              {/* Chat Header */}
              <S.ChatHeader>
                <S.ChatTitle>{currentChat.topic}</S.ChatTitle>
                <S.HeaderButtonsContainer>
                  <S.AnalyzeButton onClick={analyzeChat} disabled={analysisLoading}>
                    {analysisLoading ? 'Analyzing...' : 'Analyze Dialog'}
                  </S.AnalyzeButton>
                  <S.NeiroWorkButton onClick={getNeiroWork} disabled={neiroWorkLoading}>
                    {neiroWorkLoading ? 'Processing...' : 'NeiroWork'}
                  </S.NeiroWorkButton>
                  <S.DeleteChatButton onClick={deleteChat}>
                    Delete Chat
                  </S.DeleteChatButton>
                </S.HeaderButtonsContainer>
              </S.ChatHeader>

              {/* Analysis Display */}
              {showAnalysis && analysis && (
                <S.AnalysisContainer>
                  <S.AnalysisHeader>
                    <S.AnalysisTitle>Dialog Analysis</S.AnalysisTitle>
                    <S.CloseButton onClick={() => setShowAnalysis(false)}>×</S.CloseButton>
                  </S.AnalysisHeader>
                  <S.AnalysisContent>{analysis}</S.AnalysisContent>
                </S.AnalysisContainer>
              )}

              {/* NeiroWork Display */}
              {showNeiroWork && neiroWork && (
                <S.NeiroWorkContainer>
                  <S.NeiroWorkHeader>
                    <S.NeiroWorkTitle>NeiroWork Assistant</S.NeiroWorkTitle>
                    <S.CloseButton onClick={() => setShowNeiroWork(false)}>×</S.CloseButton>
                  </S.NeiroWorkHeader>
                  <S.NeiroWorkContent>
                    {neiroWork.summary && (
                      <S.Section>
                        <S.SectionTitle>Summary</S.SectionTitle>
                        <S.SectionContent>{neiroWork.summary}</S.SectionContent>
                      </S.Section>
                    )}

                    {neiroWork.problems && neiroWork.problems.length > 0 && (
                      <S.Section>
                        <S.SectionTitle>Problems</S.SectionTitle>
                        <S.List>
                          {neiroWork.problems.map((problem, index) => (
                            <S.ListItem key={index}>• {problem}</S.ListItem>
                          ))}
                        </S.List>
                      </S.Section>
                    )}

                    {neiroWork.todo && neiroWork.todo.length > 0 && (
                      <S.Section>
                        <S.SectionTitle>To-Do List</S.SectionTitle>
                        <S.List>
                          {neiroWork.todo.map((task, index) => (
                            <S.ListItem key={index}>□ {task}</S.ListItem>
                          ))}
                        </S.List>
                      </S.Section>
                    )}

                    {neiroWork.recommendations && neiroWork.recommendations.length > 0 && (
                      <S.Section>
                        <S.SectionTitle>Recommendations</S.SectionTitle>
                        <S.List>
                          {neiroWork.recommendations.map((rec, index) => (
                            <S.ListItem key={index}>→ {rec}</S.ListItem>
                          ))}
                        </S.List>
                      </S.Section>
                    )}
                  </S.NeiroWorkContent>
                </S.NeiroWorkContainer>
              )}

              {/* Messages */}
              <S.MessagesContainer>
                {
                  messages.map((message) => {
                    let content;
                    try {
                      // Try to parse JSON content (for messages with images)
                      const parsedContent = JSON.parse(message.content);
                      if (Array.isArray(parsedContent)) {
                        content = (
                          <div>
                            {parsedContent.map((item, index) => {
                              if (item.type === 'text' && item.text) {
                                return <p key={index}>{item.text}</p>;
                              } else if (item.type === 'image_url' && item.image_url) {
                                return (
                                  <img
                                    key={index}
                                    src={item.image_url.url}
                                    alt="Message image"
                                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                                  />
                                );
                              }
                              return null;
                            })}
                          </div>
                        );
                      } else {
                        content = message.content;
                      }
                    } catch {
                      // If not JSON, use as string
                      content = message.content;
                    }

                    return (
                      <S.MessageBubble
                        key={message.id}
                        role={message.role}
                      >
                        <S.MessageContent>{content}</S.MessageContent>
                        <S.MessageTime role={message.role}>
                          {formatTime(message.created_at)}
                        </S.MessageTime>
                      </S.MessageBubble>
                    );
                  })
                }
                {
                  isLoading && (
                    <S.LoadingText>Thinking...</S.LoadingText>
                  )
                }
                <div ref={messagesEndRef} />
              </S.MessagesContainer>

              {/* Files List */}
              {
                files.length > 0 && (
                  <S.FilesListContainer>
                    <S.FilesTitle>Files</S.FilesTitle>
                    {
                      files.map((file) => (
                        <S.FileItem key={file.id}>
                          <S.FileName>{file.filename}</S.FileName>
                          <S.FileSize>
                            {formatFileSize(file.size)}
                          </S.FileSize>
                          <S.RemoveFileButton
                            onClick={() => deleteFile(file.id)}
                          >
                            ×
                          </S.RemoveFileButton>
                        </S.FileItem>
                      ))}
                  </S.FilesListContainer>
                )}

              {/* Input Area */}
              <S.InputArea>
                <S.FileUploadArea>
                  {
                    uploadedFiles.map((file) => (
                      <S.FileItem key={file.id}>
                        <S.FileName>{file.filename}</S.FileName>
                        <S.FileSize>
                          {formatFileSize(file.size)}
                        </S.FileSize>
                      </S.FileItem>
                    ))}
                  {
                    uploadedImages.map((image) => (
                      <div key={image.id} style={{ position: 'relative', display: 'inline-block', margin: '5px' }}>
                        <img src={image.url} alt={image.filename} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
                        <button
                          onClick={() => removeImage(image.id)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </S.FileUploadArea>
                <S.InputContainer>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <label
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '1px solid #e0e0e0',
                        backgroundColor: '#f8f9fa'
                      }}
                    >
                      📷
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <S.MessageInput
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && !e.shiftKey && sendMessage()
                      }
                    />
                    <S.SendButton
                      onClick={sendMessage}
                      disabled={(!newMessage.trim() && uploadedImages.length === 0) || isLoading}
                    >
                      Send
                    </S.SendButton>
                  </div>
                </S.InputContainer>
              </S.InputArea>
            </>
          ) : (
            <S.EmptyState>
              <S.EmptyTitle>Welcome to NeiroWork</S.EmptyTitle>
              <S.EmptyText>Create a new chat to get started</S.EmptyText>
              <S.NewChatButton onClick={() => setShowModal(true)}>
                + New Chat
              </S.NewChatButton>
            </S.EmptyState>
          )}
      </S.MainContent>

      {/* Create Chat Modal */}
      {
        showModal && (
          <S.CreateChatModal>
            <S.ModalContent>
              <S.ModalTitle>Create New Chat</S.ModalTitle>
              <S.ModalInput
                type="text"
                placeholder="Enter chat topic"
                value={newChatTopic}
                onChange={(e) => setNewChatTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createChat()}
              />
              <S.ModalButtons>
                <S.CancelButton
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </S.CancelButton>
                <S.ConfirmButton
                  onClick={createChat}
                >
                  Create
                </S.ConfirmButton>
              </S.ModalButtons>
            </S.ModalContent>
          </S.CreateChatModal>
        )
      }
    </S.AppContainer>
  );
}

export default App;