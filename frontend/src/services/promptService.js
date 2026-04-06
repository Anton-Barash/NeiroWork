import axios from 'axios';

// Prompt-related API calls
export const promptService = {
  // Get all global prompts
  getGlobalPrompts: async () => {
    try {
      const response = await axios.get('/api/prompts');
      return response.data;
    } catch (error) {
      console.error('Error fetching global prompts:', error);
      throw error;
    }
  },

  // Update global prompts
  updateGlobalPrompts: async (prompts) => {
    try {
      const response = await axios.put('/api/prompts', prompts);
      return response.data;
    } catch (error) {
      console.error('Error updating global prompts:', error);
      throw error;
    }
  }
};
