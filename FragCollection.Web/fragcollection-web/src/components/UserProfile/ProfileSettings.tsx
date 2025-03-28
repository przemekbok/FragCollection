import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

// New API call to update collection info
const updateCollectionSettings = async (name: string, description: string) => {
  const response = await fetch('/api/users/collection', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update collection settings');
  }
  
  return true;
};

// New API call to get current user data including collection info
const getCurrentUserData = async () => {
  const response = await fetch('/api/users/me');
  if (!response.ok) {
    throw new Error('Failed to load user data');
  }
  return await response.json();
};

const ProfileSettings: React.FC = () => {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const userData = await getCurrentUserData();
        setCollectionName(userData.collectionName || '');
        setCollectionDescription(userData.collectionDescription || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load your collection settings');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await updateCollectionSettings(collectionName, collectionDescription);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update collection settings');
    } finally {
      setSaving(false);
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
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Collection Information
            </Typography>
            
            <TextField
              fullWidth
              required
              label="Collection Name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              margin="normal"
              disabled={saving}
            />
            
            <TextField
              fullWidth
              label="Collection Description"
              value={collectionDescription}
              onChange={(e) => setCollectionDescription(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              disabled={saving}
              helperText="Describe your collection (optional)"
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/users/${user?.username}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving || !collectionName.trim()}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfileSettings;