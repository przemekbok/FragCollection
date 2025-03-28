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
  token?: string;
  collectionName?: string;
  collectionDescription?: string;
}

// This interface is kept for backward compatibility
// In the new model, Collection data is part of the User model
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
  userId: string; // Now directly links to user instead of collection
  perfumeInfo?: PerfumeInfo;
}

export interface UserWithCollection {
  id: string;
  username: string;
  collectionName: string;
  collectionDescription: string;
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

// API endpoints for users and their collections
export const userApi = {
  // Get user profile (public view)
  getUserProfile: async (username: string) => {
    const response = await apiClient.get<UserWithCollection>(`/users/${username}`);
    return response.data;
  },
  
  // Get users with public entries
  getUsersWithPublicEntries: async (page: number = 1, pageSize: number = 10) => {
    const response = await apiClient.get<UserWithCollection[]>(`/users/public?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },
  
  // Update collection information for current user
  updateCollectionInfo: async (name: string, description: string) => {
    await apiClient.put('/users/collection', {
      name,
      description
    });
  },
  
  // Get entries for a specific user (returns all entries for owner, public entries for others)
  getUserEntries: async (username: string) => {
    const response = await apiClient.get<PerfumeEntry[]>(`/users/${username}/entries`);
    return response.data;
  }
};

// API endpoints for perfume entries (now directly linked to users)
export const perfumeEntriesApi = {
  // Get current user's entries
  getUserEntries: async () => {
    const response = await apiClient.get<PerfumeEntry[]>('/perfumeentries');
    return response.data;
  },
  
  // Get a specific entry
  getEntry: async (id: string) => {
    const response = await apiClient.get<PerfumeEntry>(`/perfumeentries/${id}`);
    return response.data;
  },
  
  // Create a new entry
  createEntry: async (entry: {
    name: string;
    brand?: string;
    type: EntryType;
    volume: number;
    pricePerMl: number;
    isPublic: boolean;
    fragranticaUrl?: string;
  }) => {
    const response = await apiClient.post<PerfumeEntry>('/perfumeentries', entry);
    return response.data;
  },
  
  // Update an entry
  updateEntry: async (id: string, entry: {
    name: string;
    brand?: string;
    type: EntryType;
    volume: number;
    pricePerMl: number;
    isPublic: boolean;
    fragranticaUrl?: string;
  }) => {
    await apiClient.put(`/perfumeentries/${id}`, entry);
  },
  
  // Update just the volume of an entry
  updateEntryVolume: async (id: string, volume: number) => {
    await apiClient.patch(`/perfumeentries/${id}/volume`, { volume });
  },
  
  // Delete an entry
  deleteEntry: async (id: string) => {
    await apiClient.delete(`/perfumeentries/${id}`);
  }
};

// Legacy API for collections - can be removed once UI is fully updated
// DEPRECATED - Use userApi instead
export const collectionsApi = {
  getUserCollections: async () => {
    console.warn('Deprecated: getUserCollections is deprecated. Use userApi.getUserProfile instead.');
    return []; // Return empty array to avoid breaking existing code
  },
  
  getPublicCollections: async (page: number = 1, pageSize: number = 10) => {
    console.warn('Deprecated: getPublicCollections is deprecated. Use userApi.getUsersWithPublicEntries instead.');
    const users = await userApi.getUsersWithPublicEntries(page, pageSize);
    // Convert to old format for backward compatibility
    return users.map(user => ({
      id: user.id, 
      name: user.collectionName, 
      description: user.collectionDescription,
      isPublic: true, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.id,
      username: user.username
    }));
  },
  
  getCollection: async (id: string) => {
    console.warn('Deprecated: getCollection is deprecated. Use userApi.getUserProfile instead.');
    throw new Error('This method is deprecated');
  },
  
  createCollection: async (name: string, description: string, isPublic: boolean) => {
    console.warn('Deprecated: createCollection is deprecated. Use userApi.updateCollectionInfo instead.');
    await userApi.updateCollectionInfo(name, description);
    throw new Error('This method is deprecated');
  },
  
  updateCollection: async (id: string, name: string, description: string, isPublic: boolean) => {
    console.warn('Deprecated: updateCollection is deprecated. Use userApi.updateCollectionInfo instead.');
    await userApi.updateCollectionInfo(name, description);
  },
  
  deleteCollection: async (id: string) => {
    console.warn('Deprecated: deleteCollection is deprecated and no longer available.');
    throw new Error('This method is deprecated');
  }
};

export default {
  auth: authApi,
  user: userApi,
  perfumeEntries: perfumeEntriesApi,
  // Legacy export for backward compatibility
  collections: collectionsApi
};