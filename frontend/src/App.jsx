import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as S from './App.styles';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessagesList from './components/MessagesList';
import FilesList from './components/FilesList';
import InputArea from './components/InputArea';
import NeiroWorkWindow from './components/NeiroWorkWindow';
import { chatService } from './services/chatService';
import { fileService } from './services/fileService';
import { promptService } from './services/promptService';

// Lazy load modal components
const PromptSettingsModal = lazy(() => import('./components/modals/PromptSettingsModal'));
const NeiroWorkPromptSettingsModal = lazy(() => import('./components/modals/NeiroWorkPromptSettingsModal'));
const LoginModal = lazy(() => import('./components/modals/LoginModal'));
const CompanySelectorModal = lazy(() => import('./components/modals/CompanySelectorModal'));
const CreateCompanyModal = lazy(() => import('./components/modals/CreateCompanyModal'));
const JoinCompanyModal = lazy(() => import('./components/modals/JoinCompanyModal'));
const CreateChatModal = lazy(() => import('./components/modals/CreateChatModal'));

function App() {
  const { user, isAuthenticated, loading: authLoading, logout, company, setCompany } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showJoinCompany, setShowJoinCompany] = useState(false);

  // Handle company creation
  const handleCompanyCreated = (newCompany) => {
    console.log('Company created:', newCompany);
    // TODO: Update company context or refresh company list
    // setCompany(newCompany); // Set the new company as current
  };
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

  // Загружаем глобальный промт один раз при инициализации
  useEffect(() => {
    const fetchGlobalPromptOnce = async () => {
      try {
        const prompts = await promptService.getGlobalPrompts();
        // Ожидается, что prompts — массив объектов с name и prompt_text
        const globalPromptObj = prompts.find(p => p.name === 'global_prompt');
        const neiroworkPromptObj = prompts.find(p => p.name === 'neiro_work');
        setPromptSettings(prev => ({
          ...prev,
          dialog_analysis_prompt: globalPromptObj ? globalPromptObj.prompt_text : prev.dialog_analysis_prompt,
          neirowork_prompt: neiroworkPromptObj ? neiroworkPromptObj.prompt_text : prev.neirowork_prompt
        }));
      } catch (error) {
        console.error('Error fetching global prompt:', error);
      }
    };
    fetchGlobalPromptOnce();
  }, []);
  const [showGlobalPromptSettings, setShowGlobalPromptSettings] = useState(false);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showNeiroWorkMenu, setShowNeiroWorkMenu] = useState(false);
  const messagesEndRef = useRef(null);

  // Show login modal if not authenticated
  useEffect(() => {
    console.log('Auth state:', { authLoading, isAuthenticated, showLoginModal });
    if (!authLoading && !isAuthenticated) {
      console.log('Setting showLoginModal to true');
      setShowLoginModal(true);
    } else {
      console.log('Setting showLoginModal to false');
      setShowLoginModal(false);
    }
  }, [authLoading, isAuthenticated]);

  // Fetch chats when company changes
  useEffect(() => {
    fetchChats();
  }, [company]);

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
      const chats = await chatService.getChats(company?.id);
      setChats(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async () => {
    if (!currentChat) return;
    try {
      const messages = await chatService.getMessages(currentChat.id);
      setMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFiles = async () => {
    if (!currentChat) return;
    try {
      const files = await fileService.getFiles(currentChat.id);
      setFiles(files);
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
      const analysis = await chatService.getAnalysis(currentChat.id);
      if (analysis.analysis_text) {
        setAnalysis(analysis.analysis_text);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const fetchCustomPrompt = async () => {
    if (!currentChat) return;
    try {
      const prompt = await chatService.getCustomPrompt(currentChat.id);
      setCustomPrompt(prompt.custom_prompt || '');
    } catch (error) {
      console.error('Error fetching custom prompt:', error);
    }
  };

  const updateCustomPrompt = async () => {
    if (!currentChat) return;
    try {
      await chatService.updateCustomPrompt(currentChat.id, customPrompt);
      setShowCustomPromptSettings(false);
    } catch (error) {
      console.error('Error updating custom prompt:', error);
    }
  };

  const fetchPromptSettings = async () => {
    if (!currentChat) return;
    try {
      const settings = await chatService.getPromptSettings(currentChat.id);
      setPromptSettings(settings);
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
      await chatService.updatePromptSettings(currentChat.id, promptSettings);
      setShowCustomPromptSettings(false);
    } catch (error) {
      console.error('Error updating prompt settings:', error);
    }
  };

  const fetchAllAnalyses = async () => {
    setAnalysesLoading(true);
    try {
      const analyses = await chatService.getAllAnalyses();
      setAllAnalyses(analyses);
    } catch (error) {
      console.error('Error fetching all analyses:', error);
    } finally {
      setAnalysesLoading(false);
    }
  };

  const createChat = async () => {
    if (!newChatTopic.trim() || !company) return;
    try {
      const newChat = await chatService.createChat(newChatTopic, company.id);
      setChats([newChat, ...chats]);
      setCurrentChat(newChat);
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
      const response = await chatService.sendMessage(currentChat.id, newMessage, uploadedImages, user?.id);

      setMessages([
        ...messages,
        response.userMessage,
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
      await chatService.deleteChat(currentChat.id);
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

  const updateChat = async (chatId, newTitle) => {
    console.log('updateChat called with:', { chatId, newTitle });
    if (!chatId) {
      console.log('No chatId provided');
      return;
    }
    try {
      console.log('Calling chatService.updateChat');
      await chatService.updateChat(chatId, newTitle);
      console.log('Chat updated successfully, updating state');
      setChats(chats.map((chat) =>
        chat.id === chatId ? { ...chat, topic: newTitle } : chat
      ));
      if (currentChat && currentChat.id === chatId) {
        setCurrentChat({ ...currentChat, topic: newTitle });
        console.log('Current chat updated in state');
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
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

    try {
      const uploadedFile = await fileService.uploadFile(currentChat.id, file);
      // Create image URL for preview
      const imageUrl = `${window.location.origin}${uploadedFile.filepath}`;
      setUploadedImages([...uploadedImages, { id: uploadedFile.id, url: imageUrl, filename: uploadedFile.filename }]);
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
      const response = await chatService.analyzeChat(currentChat.id);

      if (response && response.analysis) {
        setAnalysis(response.analysis);
        setShowAnalysis(true);

        // Refresh all analyses to reflect the updated analysis
        setTimeout(() => {
          fetchAllAnalyses();
        }, 2000);
      } else {
        console.error('Invalid analysis response:', response);
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
      {/* Only show sidebar and main content if authenticated */}
      {isAuthenticated ? (
        <>
          {/* Sidebar */}
          <Sidebar
            chats={chats}
            currentChat={currentChat}
            company={company}
            showModal={showModal}
            setShowModal={setShowModal}
            showCompanySelector={showCompanySelector}
            setShowCompanySelector={setShowCompanySelector}
            showSidebarMenu={showSidebarMenu}
            setShowSidebarMenu={setShowSidebarMenu}
            showGlobalPromptSettings={showGlobalPromptSettings}
            setShowGlobalPromptSettings={setShowGlobalPromptSettings}
            showNeiroWorkWindow={showNeiroWorkWindow}
            setShowNeiroWorkWindow={setShowNeiroWorkWindow}
            fetchAllAnalyses={fetchAllAnalyses}
            setCurrentChat={setCurrentChat}
            setShowAnalysis={setShowAnalysis}
            setShowNeiroWork={setShowNeiroWork}
            setShowCustomPromptSettings={setShowCustomPromptSettings}
            deleteChat={deleteChat}
          />

          {/* Main Content */}
          <S.MainContent>
            {
              currentChat ? (
                <>
                  {/* Chat Header */}
                  <ChatHeader
                    currentChat={currentChat}
                    analysisLoading={analysisLoading}
                    analyzeChat={analyzeChat}
                    showChatMenu={showChatMenu}
                    setShowChatMenu={setShowChatMenu}
                    setShowCustomPromptSettings={setShowCustomPromptSettings}
                    deleteChat={deleteChat}
                    updateChat={updateChat}
                  />

                  {/* Analysis Display */}
                  {showAnalysis && analysis && (
                    <S.AnalysisContainer>
                      <S.AnalysisHeader>
                        <S.AnalysisTitle>Dialog Analysis</S.AnalysisTitle>
                        <S.CloseButton onClick={() => setShowAnalysis(false)}>×</S.CloseButton>
                      </S.AnalysisHeader>
                      <S.AnalysisContent>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
                      </S.AnalysisContent>
                    </S.AnalysisContainer>
                  )}

                  {/* Messages */}
                  <MessagesList
                    messages={messages}
                    user={user}
                    isLoading={isLoading}
                    formatTime={formatTime}
                  />

                  {/* Files List */}
                  <FilesList
                    files={files}
                    deleteFile={deleteFile}
                    formatFileSize={formatFileSize}
                  />

                  {/* Input Area */}
                  <InputArea
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    uploadedFiles={uploadedFiles}
                    uploadedImages={uploadedImages}
                    isLoading={isLoading}
                    sendMessage={sendMessage}
                    handleImageUpload={handleImageUpload}
                    removeImage={removeImage}
                    formatFileSize={formatFileSize}
                  />
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
        </>
      ) : (
        <S.AuthContainer>
          <S.AuthMessage>Please log in to access NeiroWork</S.AuthMessage>
        </S.AuthContainer>
      )}

      {/* Lazy loaded components with Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        {/* Create Chat Modal */}
        <CreateChatModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          newChatTopic={newChatTopic}
          setNewChatTopic={setNewChatTopic}
          createChat={createChat}
        />

        {/* Prompt Settings Modal - Combined */}
        <PromptSettingsModal
          isOpen={showCustomPromptSettings}
          onClose={() => setShowCustomPromptSettings(false)}
          promptSettings={promptSettings}
          setPromptSettings={setPromptSettings}
          useCustomPrompt={useCustomPrompt}
          setUseCustomPrompt={setUseCustomPrompt}
          customPrompt={customPrompt}
          setCustomPrompt={setCustomPrompt}
          updateCustomPrompt={updateCustomPrompt}
          updatePromptSettings={updatePromptSettings}
        />

        {/* NeiroWork Window */}
        <NeiroWorkWindow
          isOpen={showNeiroWorkWindow}
          onClose={() => setShowNeiroWorkWindow(false)}
          allAnalyses={allAnalyses}
          analysesLoading={analysesLoading}
          fetchAllAnalyses={fetchAllAnalyses}
          setCurrentChat={setCurrentChat}
          setShowNeiroWorkWindow={setShowNeiroWorkWindow}
          setShowGlobalPromptSettings={setShowGlobalPromptSettings}
        />

        {/* Global Prompt Settings Modal */}
        <NeiroWorkPromptSettingsModal
          isOpen={showGlobalPromptSettings}
          onClose={() => setShowGlobalPromptSettings(false)}
        />

        {/* Login Modal */}
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

        {/* Company Selector Modal */}
        <CompanySelectorModal
          isOpen={showCompanySelector}
          onClose={() => setShowCompanySelector(false)}
          onCreateCompanyClick={() => setShowCreateCompany(true)}
          onJoinCompanyClick={() => setShowJoinCompany(true)}
        />

        {/* Create Company Modal */}
        <CreateCompanyModal
          isOpen={showCreateCompany}
          onClose={() => setShowCreateCompany(false)}
          onCompanyCreated={handleCompanyCreated}
        />

        {/* Join Company Modal */}
        <JoinCompanyModal
          isOpen={showJoinCompany}
          onClose={() => setShowJoinCompany(false)}
          onCompanyJoined={(company) => {
            console.log('Company joined:', company);
            // TODO: Update company list
          }}
        />
      </Suspense>
    </S.AppContainer>
  );
}

export default App;