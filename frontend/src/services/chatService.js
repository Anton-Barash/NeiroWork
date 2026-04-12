import axios from 'axios';

// Chat-related API calls
export const chatService = {
  // Get all chats for a company
  getChats: async (companyId) => {
    try {
      const response = await axios.get('/api/chat/list', {
        params: { company_id: companyId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },

  // Get messages for a chat
  getMessages: async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/chat-messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Create a new chat
  createChat: async (topic, companyId) => {
    try {
      const response = await axios.post('/api/chat/create', {
        topic,
        company_id: companyId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (chatId, content, images, userId) => {
    try {
      const response = await axios.post('/api/chat/send', {
        chat_id: chatId,
        content,
        images: images.map(img => ({ url: img.url })),
        user_id: userId || null,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Delete a chat
  deleteChat: async (chatId) => {
    try {
      await axios.delete(`/api/chat/${chatId}`);
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  },

  // Update chat title
  updateChat: async (chatId, newTitle) => {
    try {
      await axios.put(`/api/chat/${chatId}`, {
        topic: newTitle
      });
      return true;
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  },

  // Analyze a chat
  analyzeChat: async (chatId) => {
    try {
      const response = await axios.post(`/api/chat/${chatId}/analyze`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing chat:', error);
      throw error;
    }
  },

  // Get chat analysis
  getAnalysis: async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analysis:', error);
      throw error;
    }
  },

  // Get custom prompt for a chat
  getCustomPrompt: async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/custom-prompt`);
      return response.data;
    } catch (error) {
      console.error('Error fetching custom prompt:', error);
      throw error;
    }
  },

  // Update custom prompt for a chat
  updateCustomPrompt: async (chatId, customPrompt, useCustomPrompt) => {
    try {
      await axios.put(`/api/chat/${chatId}/custom-prompt`, {
        custom_prompt: customPrompt,
        use_custom_prompt: useCustomPrompt
      });
      return true;
    } catch (error) {
      console.error('Error updating custom prompt:', error);
      throw error;
    }
  },

  // Get prompt settings for a chat
  getPromptSettings: async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/prompt-settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prompt settings:', error);
      throw error;
    }
  },

  // Update prompt settings for a chat
  updatePromptSettings: async (chatId, promptSettings) => {
    try {
      await axios.put(`/api/chat/${chatId}/prompt-settings`, {
        dialog_analysis_prompt: promptSettings.dialog_analysis_prompt,
        neirowork_prompt: promptSettings.neirowork_prompt
      });
      return true;
    } catch (error) {
      console.error('Error updating prompt settings:', error);
      throw error;
    }
  },

  // Get all analyses for all chats
  getAllAnalyses: async () => {
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

      return await Promise.all(analysesPromises);
    } catch (error) {
      console.error('Error fetching all analyses:', error);
      throw error;
    }
  }
};
