import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Chats
export const getChats = () => api.get('/chat/list');
export const createChat = (topic) => api.post('/chat/create', { topic });
export const deleteChat = (chatId) => api.delete(`/chat/${chatId}`);

// Custom Prompt
export const getCustomPrompt = (chatId) => api.get(`/chat/${chatId}/custom-prompt`);
export const updateCustomPrompt = (chatId, custom_prompt) =>
    api.put(`/chat/${chatId}/custom-prompt`, { custom_prompt });

// Prompt Settings
export const getPromptSettings = (chatId) => api.get(`/chat/${chatId}/prompt-settings`);
export const updatePromptSettings = (chatId, settings) =>
    api.put(`/chat/${chatId}/prompt-settings`, settings);

// Messages
export const getMessages = (chatId) => api.get(`/chat/${chatId}/messages`);
export const sendMessage = (chatId, content, images = []) =>
    api.post(`/chat/${chatId}/send`, { chat_id: chatId, content, images });

// Analysis
export const getAnalysis = (chatId) => api.get(`/chat/${chatId}/analysis`);
export const analyzeChat = (chatId) => api.post(`/chat/${chatId}/analyze`);
export const getNeiroWorkAnalysis = (chatId) =>
    api.post(`/chat/${chatId}/neiro-work`);

// Files
export const getFiles = (chatId) => api.get(`/files/${chatId}`);
export const uploadFile = (formData, chatId) =>
    api.post('/files/upload', formData, { params: { chat_id: chatId } });
export const deleteFile = (fileId) => api.delete(`/files/${fileId}`);

// Global Prompts
export const getGlobalPrompts = () => api.get('/prompts');
export const getGlobalPrompt = (name) => api.get(`/prompts/${name}`);
export const updateGlobalPrompt = (name, prompt_text) =>
    api.put(`/prompts/${name}`, { name, prompt_text });



// Images
export const getImages = (chatId) => api.get(`/chat/${chatId}/images`);

export default api;