// src/components/UserProfiles/ProfileSettings.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { userApi } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component to manage user's collection settings
 * Replaces the old CollectionForm component
 */
export const ProfileSettings: React.FC = () => {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Get current collection settings
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await userApi.getUserProfile(user.username);
        setCollectionName(profile.collectionName);
        setCollectionDescription(profile.collectionDescription);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load your collection settings');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);
      
      await userApi.updateCollectionInfo(collectionName, collectionDescription);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update collection settings');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Collection Settings
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Collection settings updated successfully!
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="collectionName"
              label="Collection Name"
              name="collectionName"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              disabled={updating}
            />
            <TextField
              margin="normal"
              fullWidth
              id="collectionDescription"
              label="Description"
              name="collectionDescription"
              multiline
              rows={4}
              value={collectionDescription}
              onChange={(e) => setCollectionDescription(e.target.value)}
              disabled={updating}
              placeholder="Tell others about your collection..."
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/users/${user?.username}`)}
                disabled={updating}
              >
                Back to Collection
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={updating}
              >
                {updating ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfileSettings;