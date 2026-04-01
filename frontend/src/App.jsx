import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import * as S from './App.styles';
import PromptSettingsModal from './components/modals/PromptSettingsModal';
import GlobalPromptSettingsModal from './components/modals/GlobalPromptSettingsModal';
import NeiroWorkPromptSettingsModal from './components/modals/NeiroWorkPromptSettingsModal';

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

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showNeiroWork, setShowNeiroWork] = useState(false);
  const [showNeiroWorkWindow, setShowNeiroWorkWindow] = useState(false);
  const [allAnalyses, setAllAnalyses] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [neiroWorkLoading, setNeiroWorkLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPromptSettings, setShowCustomPromptSettings] = useState(false);
  const [promptSettings, setPromptSettings] = useState({
    dialog_analysis_prompt: '',
    neirowork_prompt: ''
  });
  const [showAdvancedPromptSettings, setShowAdvancedPromptSettings] = useState(false);
  const [showGlobalPromptSettings, setShowGlobalPromptSettings] = useState(false);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showNeiroWorkMenu, setShowNeiroWorkMenu] = useState(false);
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
      // Fetch custom prompt if available
      fetchCustomPrompt();
      // Fetch prompt settings if available
      fetchPromptSettings();
    }
  }, [currentChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setShowCustomPromptSettings(false);
        setShowNeiroWorkWindow(false);
        setShowSidebarMenu(false);
        setShowChatMenu(false);
        setShowNeiroWorkMenu(false); // Close NeiroWork menu as well
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.sidebar-menu')) {
        setShowSidebarMenu(false);
      }
      if (!e.target.closest('.neirowork-menu')) {
        setShowNeiroWorkMenu(false);
      }
      if (!e.target.closest('.chat-menu')) {
        setShowChatMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  const fetchCustomPrompt = async () => {
    if (!currentChat) return;
    try {
      const response = await axios.get(`/api/chat/${currentChat.id}/custom-prompt`);
      setCustomPrompt(response.data.custom_prompt || '');
    } catch (error) {
      console.error('Error fetching custom prompt:', error);
    }
  };

  const updateCustomPrompt = async () => {
    if (!currentChat) return;
    try {
      await axios.put(`/api/chat/${currentChat.id}/custom-prompt`, {
        custom_prompt: customPrompt
      });
      setShowCustomPromptSettings(false);
    } catch (error) {
      console.error('Error updating custom prompt:', error);
    }
  };

  const fetchPromptSettings = async () => {
    if (!currentChat) return;
    try {
      const response = await axios.get(`/api/chat/${currentChat.id}/prompt-settings`);
      setPromptSettings(response.data);
    } catch (error) {
      console.error('Error fetching prompt settings:', error);
    }
  };

  const fetchGlobalPrompts = async () => {
    try {
      const response = await axios.get('/api/prompts');
      console.log('API /api/prompts response:', response.data);
    } catch (error) {
      console.error('Error fetching global prompts:', error);
    }
  };

  const updatePromptSettings = async () => {
    if (!currentChat) return;
    try {
      await axios.put(`/api/chat/${currentChat.id}/prompt-settings`, {
        dialog_analysis_prompt: promptSettings.dialog_analysis_prompt,
        neirowork_prompt: promptSettings.neirowork_prompt
      });
      setShowCustomPromptSettings(false);
    } catch (error) {
      console.error('Error updating prompt settings:', error);
    }
  };

  const fetchAllAnalyses = async () => {
    setAnalysesLoading(true);
    try {
      // First get all chats
      const chatsResponse = await axios.get('/api/chat/list');
      const chats = chatsResponse.data;

      // For each chat, get its analysis
      const analysesPromises = chats.map(async (chat) => {
        try {
          const analysisResponse = await axios.get(`/api/chat/${chat.id}/analysis`);
          // Use analysis_text if it exists, otherwise use analysis, and fallback to null
          const analysisText = analysisResponse.data.analysis_text !== undefined ?
            analysisResponse.data.analysis_text :
            analysisResponse.data.analysis;

          return {
            chat,
            analysis: analysisText,
            hasNewMessages: analysisResponse.data.has_new_messages
          };
        } catch (error) {
          console.error(`Error fetching analysis for chat ${chat.id}:`, error);
          return {
            chat,
            analysis: null,
            hasNewMessages: true
          };
        }
      });

      const analyses = await Promise.all(analysesPromises);
      setAllAnalyses(analyses);
    } catch (error) {
      console.error('Error fetching all analyses:', error);
    } finally {
      setAnalysesLoading(false);
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
      console.log('Starting chat analysis for chat ID:', currentChat.id);
      const response = await axios.post(`/api/chat/${currentChat.id}/analyze`);
      console.log('Analysis response:', response.data);

      if (response.data && response.data.analysis) {
        console.log('Setting analysis:', response.data.analysis);
        setAnalysis(response.data.analysis);
        setShowAnalysis(true);

        // Refresh all analyses to reflect the updated analysis
        setTimeout(() => {
          fetchAllAnalyses();
        }, 2000);
      } else {
        console.error('Invalid analysis response:', response.data);
      }
    } catch (error) {
      console.error('Error analyzing chat:', error);
    } finally {
      setAnalysisLoading(false);
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
          <S.SidebarTopRow>
            <S.AppTitleButton onClick={() => {
              setShowNeiroWorkWindow(true);
              fetchAllAnalyses();
            }}>
              NeiroWork
            </S.AppTitleButton>
            <S.MoreButton className="sidebar-menu" onClick={() => setShowSidebarMenu(!showSidebarMenu)}>
              ...
            </S.MoreButton>
            {showSidebarMenu && (
              <S.DropdownMenu className="sidebar-menu">
                <S.DropdownItem onClick={() => {

                  setShowAdvancedPromptSettings(true);
                  setShowSidebarMenu(false);
                }}>
                  Neiro Work Prompt Settings
                </S.DropdownItem>
              </S.DropdownMenu>
            )}
          </S.SidebarTopRow>
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
                <div style={{ position: 'relative' }}>
                  <S.HeaderButtonsContainer>
                    <S.AnalyzeButton onClick={analyzeChat} disabled={analysisLoading}>
                      {analysisLoading ? 'Analyzing...' : 'Analyze Dialog'}
                    </S.AnalyzeButton>
                    <S.MoreButton className="chat-menu" onClick={() => setShowChatMenu(!showChatMenu)}>
                      ...
                    </S.MoreButton>
                  </S.HeaderButtonsContainer>
                  {showChatMenu && (
                    <S.DropdownMenu className="chat-menu" style={{ right: 0, left: 'auto' }}>
                      <S.DropdownItem onClick={() => { setShowCustomPromptSettings(true); setShowChatMenu(false); }}>
                        Настройки промпта чата
                      </S.DropdownItem>
                      <S.DropdownItem onClick={() => { deleteChat(); setShowChatMenu(false); }} style={{ color: '#dc3545' }}>
                        Delete
                      </S.DropdownItem>
                    </S.DropdownMenu>
                  )}
                </div>
              </S.ChatHeader>

              {/* Analysis Display */}
              {showAnalysis && analysis && (
                <S.AnalysisContainer>
                  <S.AnalysisHeader>
                    <S.AnalysisTitle>Dialog Analysis</S.AnalysisTitle>
                    <S.CloseButton onClick={() => setShowAnalysis(false)}>×</S.CloseButton>
                  </S.AnalysisHeader>
                  <S.AnalysisContent>
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </S.AnalysisContent>
                </S.AnalysisContainer>
              )}

              {/* NeiroWork Display */}
              {showNeiroWork && neiroWork && (
                <S.NeiroWorkContainer>
                  <S.NeiroWorkHeader>
                    <S.NeiroWorkContainerTitle>NeiroWork Assistant</S.NeiroWorkContainerTitle>
                    <S.CloseButton onClick={() => setShowNeiroWork(false)}>×</S.CloseButton>
                  </S.NeiroWorkHeader>
                  <S.NeiroWorkContainerContent>
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
                  </S.NeiroWorkContainerContent>
                </S.NeiroWorkContainer>
              )}

              {/* Messages */}
              <S.MessagesContainer>
                {
                  messages.map((message) => {
                    let content;
                    /*
                  ❗ POTENTIAL ERROR: JSON.parse without type checking can cause crashes
                     If message.content is not a string, JSON.parse will throw an error
                     FIX: Check if message.content is a string before parsing
                  */
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
          <S.CreateChatModal onClick={() => setShowModal(false)}>
            <S.ModalContent onClick={(e) => e.stopPropagation()}>
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

      {/* Prompt Settings Modal - Combined */}
      {
        showCustomPromptSettings && (
          <S.CreateChatModal onClick={() => setShowCustomPromptSettings(false)}>
            <S.ModalContent onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '700px' }}>
              <S.ModalTitle>Настройки промпта анализа</S.ModalTitle>

              {/* Global Prompt */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#343a40' }}>
                  Общий промт (для всех чатов):
                </label>
                <S.ModalTextarea
                  value={promptSettings.dialog_analysis_prompt || ''}
                  onChange={(e) => setPromptSettings({ ...promptSettings, dialog_analysis_prompt: e.target.value })}
                  placeholder="Введите общий промт для анализа диалогов..."
                  rows={4}
                />
              </div>

              {/* Checkbox */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="useCustomPrompt"
                  checked={useCustomPrompt}
                  onChange={(e) => setUseCustomPrompt(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="useCustomPrompt" style={{ fontSize: '14px', color: '#495057', cursor: 'pointer' }}>
                  Использовать индивидуальный промт для этого чата
                </label>
              </div>

              {/* Individual Prompt */}
              {useCustomPrompt && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#667eea' }}>
                    Индивидуальный промт (для этого чата):
                  </label>
                  <S.ModalTextarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Введите индивидуальный промт для этого чата..."
                    rows={4}
                  />
                </div>
              )}

              <S.ModalButtons>
                <S.CancelButton onClick={() => setShowCustomPromptSettings(false)}>
                  Отмена
                </S.CancelButton>
                <S.ConfirmButton onClick={() => {
                  updateCustomPrompt();
                  // Update global prompt if not using individual prompt
                  if (!useCustomPrompt && promptSettings.dialog_analysis_prompt) {
                    // Update the global prompt in ai_prompts table
                    axios.put('/api/prompts/dialog_analysis', {
                      name: 'dialog_analysis',
                      prompt_text: promptSettings.dialog_analysis_prompt
                    }).catch(err => console.error('Error updating global prompt:', err));
                  } else {
                    // Update the chat-specific prompt in chat_prompts_settings table
                    updatePromptSettings();
                  }
                }}>
                  Сохранить
                </S.ConfirmButton>
              </S.ModalButtons>
            </S.ModalContent>
          </S.CreateChatModal>
        )
      }


      {/* NeiroWork Window */}
      {
        showNeiroWorkWindow && (
          <S.CreateChatModal onClick={() => setShowNeiroWorkWindow(false)}>
            <S.ModalContent
              style={{
                width: '80%',
                maxWidth: '800px',
                maxHeight: '80vh',
                overflowY: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <S.NeiroWorkWindowTitle>NeiroWork Overview</S.NeiroWorkWindowTitle>
                <S.MoreButton className="neirowork-menu" onClick={() => setShowGlobalPromptSettings(true)}>
                  ...
                </S.MoreButton>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Analysis of all chat dialogs</p>
                <S.AnalyzeButton
                  onClick={fetchAllAnalyses}
                  disabled={analysesLoading}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  {analysesLoading ? 'Loading...' : 'Refresh Analyses'}
                </S.AnalyzeButton>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {analysesLoading ? (
                  <S.LoadingText>Loading analyses...</S.LoadingText>
                ) : allAnalyses.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>No chats found. Create a chat to start analysis.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {allAnalyses.map((item) => (
                      <div key={item.chat.id} style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: item.hasNewMessages ? '#fff3cd' : '#f8f9fa',
                        margin: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '16px' }}>{item.chat.topic}</h4>
                          <S.AnalyzeButton
                            onClick={() => {
                              setCurrentChat(item.chat);
                              setShowNeiroWorkWindow(false);
                            }}
                            style={{ fontSize: '12px', padding: '4px 8px' }}
                          >
                            View Chat
                          </S.AnalyzeButton>
                        </div>
                        <div style={{
                          margin: '10px 0',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          color: '#555'
                        }}>
                          {item.analysis ? (
                            <ReactMarkdown>{item.analysis}</ReactMarkdown>
                          ) : (
                            'No analysis available. Click "Analyze Dialog" in the chat to generate.'
                          )}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#999',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>Created: {new Date(item.chat.created_at).toLocaleString()}</span>
                          {item.hasNewMessages && (
                            <span style={{ color: '#ffc107', fontWeight: '500' }}>New messages</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <S.ModalButtons style={{ marginTop: '20px', paddingTop: '15px', margin: '15px' }}>
                <S.CancelButton
                  onClick={() => setShowNeiroWorkWindow(false)}
                >
                  Close
                </S.CancelButton>
              </S.ModalButtons>
            </S.ModalContent>
          </S.CreateChatModal>
        )}

      {/* Global Prompt Settings Modal */}
      {/* <GlobalPromptSettingsModal 
        isOpen={showGlobalPromptSettings} 
        onClose={() => setShowGlobalPromptSettings(false)} 
      /> */}
    </S.AppContainer>
  );
}

export default App;