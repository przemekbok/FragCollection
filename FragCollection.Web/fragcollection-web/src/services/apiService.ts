// src/services/apiService.ts
import axios from 'axios';

// Define base API URL
const API_URL = 'https://localhost:54378/api';

// Create axios instance with credentials
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Keep this for compatibility with existing cookie auth
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include auth token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Type definitions for API responses
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  token?: string; // Add token field
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  username: string;
}

export enum EntryType {
  Bottle = 0,
  Decant = 1
}

export enum NoteType {
  Top = 0,
  Middle = 1,
  Base = 2
}

export interface PerfumeNote {
  id: string;
  name: string;
  type: NoteType;
}

export interface PerfumeInfo {
  id: string;
  name: string;
  brand: string;
  description?: string;
  imageUrl?: string;
  fragranticaUrl: string;
  topNotes: PerfumeNote[];
  middleNotes: PerfumeNote[];
  baseNotes: PerfumeNote[];
}

export interface PerfumeEntry {
  id: string;
  name: string;
  brand?: string;
  type: EntryType;
  volume: number;
  pricePerMl: number;
  totalPrice: number; // Calculated field from backend
  isPublic: boolean;
  fragranticaUrl?: string;
  addedAt: string;
  updatedAt: string;
  collectionId: string;
  perfumeInfo?: PerfumeInfo;
}

// API endpoints for authentication
export const authApi = {
  login: async (usernameOrEmail: string, password: string, rememberMe: boolean = false) => {
    const response = await apiClient.post<User>('/users/login', {
      usernameOrEmail,
      password,
      rememberMe
    });
    
    // Store token if received
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },
  
  register: async (username: string, email: string, password: string) => {
    const response = await apiClient.post<User>('/users/register', {
      username,
      email,
      password
    });
    
    // Store token if received
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },
  
  logout: async () => {
    try {
      await apiClient.post('/users/logout');
    } finally {
      // Always remove token on logout regardless of API response
      localStorage.removeItem('auth_token');
    }
  },
  
  getCurrentUser: async () => {
    try {
      // Check if we have a token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return null;
      }
      
      const response = await apiClient.get<User>('/users/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('auth_token'); // Clear invalid token
      return null;
    }
  }
};

// API endpoints for collections
export const collectionsApi = {
  getUserCollections: async () => {
    const response = await apiClient.get<Collection[]>('/collections');
    return response.data;
  },
  
  getPublicCollections: async (page: number = 1, pageSize: number = 10) => {
    const response = await apiClient.get<Collection[]>(`/collections/public?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },
  
  getCollection: async (id: string) => {
    const response = await apiClient.get<Collection>(`/collections/${id}`);
    return response.data;
  },
  
  createCollection: async (name: string, description: string, isPublic: boolean) => {
    const response = await apiClient.post<Collection>('/collections', {
      name,
      description,
      isPublic
    });
    return response.data;
  },
  
  updateCollection: async (id: string, name: string, description: string, isPublic: boolean) => {
    await apiClient.put(`/collections/${id}`, {
      name,
      description,
      isPublic
    });
  },
  
  deleteCollection: async (id: string) => {
    await apiClient.delete(`/collections/${id}`);
  }
};

// API endpoints for perfume entries
export const perfumeEntriesApi = {
  getEntriesByCollection: async (collectionId: string) => {
    const response = await apiClient.get<PerfumeEntry[]>(`/perfumeentries/collection/${collectionId}`);
    return response.data;
  },
  
  getEntry: async (id: string) => {
    const response = await apiClient.get<PerfumeEntry>(`/perfumeentries/${id}`);
    return response.data;
  },
  
  createEntry: async (entry: {
    name: string;
    brand?: string;
    type: EntryType;
    volume: number;
    pricePerMl: number;
    isPublic: boolean;
    fragranticaUrl?: string;
    collectionId: string;
  }) => {
    const response = await apiClient.post<PerfumeEntry>('/perfumeentries', entry);
    return response.data;
  },
  
  updateEntry: async (id: string, entry: {
    name: string;
    brand?: string;
    type: EntryType;
    volume: number;
    pricePerMl: number;
    isPublic: boolean;
    fragranticaUrl?: string;
    collectionId: string;
  }) => {
    await apiClient.put(`/perfumeentries/${id}`, entry);
  },
  
  updateEntryVolume: async (id: string, volume: number) => {
    await apiClient.patch(`/perfumeentries/${id}/volume`, { volume });
  },
  
  deleteEntry: async (id: string) => {
    await apiClient.delete(`/perfumeentries/${id}`);
  }
};

export default {
  auth: authApi,
  collections: collectionsApi,
  perfumeEntries: perfumeEntriesApi
};