# Single Collection Per User Implementation Guide

This document outlines the changes made to implement the single collection per user model and public visibility of entries.

## Overview of Changes

The main requirements were:
1. Each user should have only one collection
2. Users should be able to choose which entries in their collection are publicly visible
3. Site visitors should be able to view user profiles without authorization
4. Site visitors should see only public entries in user collections

## Backend Changes

### Model Changes

1. **User Model**:
   - Added `CollectionName` and `CollectionDescription` properties
   - Changed navigation property to directly reference entries instead of collections

2. **PerfumeEntry Model**:
   - Changed foreign key from `CollectionId` to `UserId`
   - Changed navigation property from `Collection` to `User`
   - Kept `IsPublic` flag to indicate if an entry is publicly visible

3. **Collection Model**:
   - Marked as deprecated
   - Will be removed in a future update once all dependencies are updated

### Service Changes

1. **UserService**:
   - Added methods for managing collection information
   - Added method to get users with public entries

2. **PerfumeEntryService**:
   - Updated to work with user IDs instead of collection IDs
   - Added method to get only public entries for a user

### API Changes

1. **UsersController**:
   - Added endpoints for getting public user profiles
   - Added endpoints for getting user's entries (public/all)
   - Added endpoint for updating collection information

2. **PerfumeEntriesController**:
   - Updated to work with user IDs instead of collection IDs
   - Simplified API by removing collection references

3. **CollectionsController**:
   - Deprecated and will be removed in a future update

### Database Changes

1. **Migration**: Added a migration `20250328200500_SingleCollectionPerUser` that:
   - Adds collection fields to User table
   - Adds UserId to PerfumeEntry table
   - Migrates existing data to the new structure

## Frontend Changes Required

The following changes need to be made to the frontend:

### API Service Changes

1. Update `apiService.ts`:
   - Remove `Collection` interface or mark as deprecated
   - Update `User` interface to include collection information
   - Update `PerfumeEntry` interface to reference user instead of collection
   - Add new endpoints for user profiles and entries

Example changes for `apiService.ts`:

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  token?: string;
  collectionName: string;
  collectionDescription: string;
}

export interface PerfumeEntry {
  id: string;
  name: string;
  brand?: string;
  type: EntryType;
  volume: number;
  pricePerMl: number;
  totalPrice: number;
  isPublic: boolean;
  fragranticaUrl?: string;
  addedAt: string;
  updatedAt: string;
  userId: string;
  perfumeInfo?: PerfumeInfo;
}

// New endpoint examples
export const userApi = {
  // Existing methods...
  
  // Get user profile by username (public)
  getUserByUsername: async (username: string) => {
    const response = await apiClient.get<UserProfile>(`/users/${username}`);
    return response.data;
  },
  
  // Get user entries (public or all depending on auth)
  getUserEntries: async (username: string) => {
    const response = await apiClient.get<PerfumeEntry[]>(`/users/${username}/entries`);
    return response.data;
  },
  
  // Update collection info
  updateCollectionInfo: async (name: string, description: string) => {
    await apiClient.put('/users/collection', { name, description });
  }
};

// Update perfume entries API
export const perfumeEntriesApi = {
  // Get current user's entries
  getUserEntries: async () => {
    const response = await apiClient.get<PerfumeEntry[]>('/perfumeentries');
    return response.data;
  },
  
  // Other methods adjusted to not require collectionId...
};
```

### Component Changes

1. Replace `CollectionsList` and related components:
   - Create a new `UserProfile` component for viewing user profiles
   - Create a `CollectionSettings` component for managing collection info
   - Update `HomePage` to display users with public collections

2. Update `PerfumeEntryForm` and related components:
   - Remove collection selection (no longer needed)
   - Add visibility toggle for public/private entries

3. Update routes in `App.tsx`:
   - Add routes for user profiles
   - Update existing routes to match new APIs

Example of new routes:

```tsx
<Routes>
  {/* ... */}
  <Route path="/profile" element={<CollectionSettings />} />
  <Route path="/users/:username" element={<UserProfile />} />
  <Route path="/entries/new" element={<PerfumeEntryForm />} />
  {/* ... */}
</Routes>
```

## Migration Path

1. Deploy backend changes first
2. Update frontend to work with new APIs
3. Keep compatibility with old APIs during transition
4. Once everything is working, remove deprecated Collection model and APIs

## Testing Requirements

1. Test data migration to ensure no data loss
2. Test all user scenarios:
   - Registering new users
   - Adding entries to personal collection
   - Setting entries as public/private
   - Viewing other users' profiles
   - Viewing only public entries of other users
   - Managing own collection settings