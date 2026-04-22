/**
 * API Client
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

// Get API URLs from environment variables
const NODE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5000';

// Create axios instance for Node.js backend
const nodeApi = axios.create({
  baseURL: NODE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for Python backend
const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// CONVERSATION API (Node.js Backend)
// ============================================

export const conversationAPI = {
  // Get all conversations
  getAll: () => nodeApi.get('/conversations'),

  // Get single conversation with messages
  getById: (id) => nodeApi.get(`/conversations/${id}`),

  // Create new conversation
  create: (data = {}) => nodeApi.post('/conversations', data),

  // Update conversation
  update: (id, data) => nodeApi.patch(`/conversations/${id}`, data),

  // Delete conversation
  delete: (id) => nodeApi.delete(`/conversations/${id}`),

  // Send/save a message (pass role: 'user' or 'assistant')
  sendMessage: (id, content, role = 'user') =>
    nodeApi.post(`/conversations/${id}/messages`, { content, role }),
};

// ============================================
// DOCUMENT API (Node.js Backend)
// ============================================

export const documentAPI = {
  // Upload documents
  upload: (conversationId, files) => {
    const formData = new FormData();
    formData.append('conversationId', conversationId);

    // Append each file
    files.forEach((file) => {
      formData.append('documents', file);
    });

    return nodeApi.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get documents for a conversation
  getByConversation: (conversationId) =>
    nodeApi.get(`/documents/conversation/${conversationId}`),

  // Delete document
  delete: (id) => nodeApi.delete(`/documents/${id}`),
};

// ============================================
// AI QUERY API (Python Backend - Enhanced)
// ============================================

export const aiAPI = {
  // Send query to AI with enhanced response
  query: async (question, chatHistory = [], vectorNamespaces = [], featureUsed = 'Analytical_Insights') => {
    try {
      const response = await pythonApi.post('/query', {
        question,
        chatHistory,
        vectorNamespaces,
        featureUsed
      });

      return response.data;
    } catch (error) {
      console.error('AI Query Error:', error);
      throw error;
    }
  },

  // Test financial tools
  testTools: () => pythonApi.post('/test-tools'),

  // Health check
  health: () => pythonApi.get('/health'),
};

// Export default api instance for custom requests
export default nodeApi;
export { pythonApi };
