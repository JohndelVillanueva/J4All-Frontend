import axios from 'axios';

// Use environment variable with fallback for development
const API_BASE_URL = 'http://j4pwds.com/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  photo: string | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender: User;
  receiver: User;
}

export interface Conversation {
  id: number;
  other_user: User;
  last_message: Message | null;
  updated_at: string;
  unread_count: number;
}

export interface CreateMessageData {
  receiver_id: number;
  content: string;
}

export interface CreateConversationData {
  participant2_id: number;
}

export const messageService = {
  // Get all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    try {
      console.log('🔗 Making API call to:', `${API_BASE_URL}/messages/conversations`);
      console.log('🔑 Auth token exists:', !!localStorage.getItem('token'));
      
      const response = await apiClient.get('/messages/conversations');
      console.log('📡 API Response status:', response.status);
      console.log('📦 API Response data:', response.data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching conversations:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get messages for a specific conversation
  async getMessages(conversationId: number): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/messages/conversations/${conversationId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Create a new conversation
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      const response = await apiClient.post('/messages/conversations', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(conversationId: number, data: CreateMessageData): Promise<Message> {
    try {
      const response = await apiClient.post(`/messages/conversations/${conversationId}/messages`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get unread messages count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get('/messages/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Get a single conversation by ID
  async getConversation(conversationId: number): Promise<Conversation> {
    try {
      const response = await apiClient.get(`/messages/conversations/${conversationId}/info`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  // Mark messages as read for a conversation (this happens automatically when fetching messages)
  async markMessagesAsRead(conversationId: number): Promise<void> {
    try {
      // Simply fetch messages to trigger the backend's auto-read marking
      await apiClient.get(`/messages/conversations/${conversationId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },
};