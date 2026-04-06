import axios from 'axios';

// File-related API calls
export const fileService = {
  // Get files for a chat
  getFiles: async (chatId) => {
    try {
      const response = await axios.get(`/api/files/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },

  // Upload a file
  uploadFile: async (chatId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/files/upload', formData, {
        params: { chat_id: chatId },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Delete a file
  deleteFile: async (fileId) => {
    try {
      await axios.delete(`/api/files/${fileId}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Get images for a chat
  getImages: async (chatId) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}/images`);
      return response.data;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  }
};
