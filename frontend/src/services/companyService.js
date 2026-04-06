import axios from 'axios';

// Company-related API calls
export const companyService = {
  // Get all companies for the current user
  getCompanies: async () => {
    try {
      const response = await axios.get('/api/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  // Create a new company
  createCompany: async (companyData) => {
    try {
      const response = await axios.post('/api/companies', companyData);
      return response.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  // Join a company
  joinCompany: async (companyCode) => {
    try {
      const response = await axios.post('/api/companies/join', { code: companyCode });
      return response.data;
    } catch (error) {
      console.error('Error joining company:', error);
      throw error;
    }
  }
};
