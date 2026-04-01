import React, { createContext, useContext, useEffect } from 'react';
import { useChats } from '../hooks/useChats';
import { useMessages } from '../hooks/useMessages';
import { useAnalysis } from '../hooks/useAnalysis';

const ChatContext = createContext(null);

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}

export function ChatProvider({ children }) {
    const chatsHook = useChats();
    const messagesHook = useMessages();
    const analysisHook = useAnalysis();

    useEffect(() => {
        chatsHook.fetchChats();
    }, []);

    useEffect(() => {
        if (chatsHook.currentChat) {
            messagesHook.fetchMessages(chatsHook.currentChat.id);
            messagesHook.fetchFiles(chatsHook.currentChat.id);
            analysisHook.fetchAnalysis(chatsHook.currentChat.id);
            analysisHook.fetchCustomPrompt(chatsHook.currentChat.id);
            analysisHook.fetchPromptSettings(chatsHook.currentChat.id);
        }
    }, [chatsHook.currentChat?.id]);

    const value = {
        chats: chatsHook.chats,
        currentChat: chatsHook.currentChat,
        isLoading: chatsHook.isLoading,
        fetchChats: chatsHook.fetchChats,
        createChat: chatsHook.createChat,
        deleteChat: chatsHook.deleteChat,
        selectChat: chatsHook.selectChat,
        clearCurrentChat: chatsHook.clearCurrentChat,

        messages: messagesHook.messages,
        newMessage: messagesHook.newMessage,
        setNewMessage: messagesHook.setNewMessage,
        isSending: messagesHook.isSending,
        uploadedFiles: messagesHook.uploadedFiles,
        uploadedImages: messagesHook.uploadedImages,
        files: messagesHook.files,
        messagesEndRef: messagesHook.messagesEndRef,
        sendMessage: () => messagesHook.sendMessage(chatsHook.currentChat?.id),
        handleFileUpload: (file) => messagesHook.handleFileUpload(file, chatsHook.currentChat?.id),
        handleImageUpload: (file) => messagesHook.handleImageUpload(file, chatsHook.currentChat?.id),
        removeImage: messagesHook.removeImage,
        deleteFile: messagesHook.deleteFile,

        analysis: analysisHook.analysis,
        setAnalysis: analysisHook.setAnalysis,
        showAnalysis: analysisHook.showAnalysis,
        setShowAnalysis: analysisHook.setShowAnalysis,
        analysisLoading: analysisHook.analysisLoading,
        customPrompt: analysisHook.customPrompt,
        setCustomPrompt: analysisHook.setCustomPrompt,
        showCustomPromptSettings: analysisHook.showCustomPromptSettings,
        setShowCustomPromptSettings: analysisHook.setShowCustomPromptSettings,
        promptSettings: analysisHook.promptSettings,
        setPromptSettings: analysisHook.setPromptSettings,
        showAdvancedPromptSettings: analysisHook.showAdvancedPromptSettings,
        setShowAdvancedPromptSettings: analysisHook.setShowAdvancedPromptSettings,
        analyzeChat: () => analysisHook.analyzeChat(chatsHook.currentChat?.id),
        updateCustomPrompt: () => analysisHook.updateCustomPrompt(chatsHook.currentChat?.id),
        updatePromptSettings: () => analysisHook.updatePromptSettings(chatsHook.currentChat?.id),

        // Global prompts
        globalPrompts: analysisHook.globalPrompts,
        fetchGlobalPrompts: analysisHook.fetchGlobalPrompts,
        updateGlobalPrompt: analysisHook.updateGlobalPrompt,
        showGlobalPromptSettings: analysisHook.showGlobalPromptSettings,
        setShowGlobalPromptSettings: analysisHook.setShowGlobalPromptSettings
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}