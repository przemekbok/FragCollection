import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { userApi } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const CollectionSettings: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load user's collection info
    const loadUserInfo = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setInitialLoading(true);
        // If user has collectionName/collectionDescription in their profile, use it
        if (user.collectionName) {
          setName(user.collectionName);
        }
        
        if (user.collectionDescription) {
          setDescription(user.collectionDescription || '');
        }
        
        // Otherwise fetch from API if needed
        // Note: In this version the user profile should already have this info
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load your collection information');
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserInfo();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await userApi.updateCollectionInfo(name, description);
      
      setSuccess('Collection information updated successfully');
      
      // Update local user state if needed
      // This would typically be handled through a context update
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update collection information');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Collection Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              helperText="This is the name displayed for your perfume collection"
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Collection Description"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              helperText="Add a description about your collection, your interests, etc."
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/users/${user?.username}`)}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CollectionSettings;