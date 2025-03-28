// src/components/UserProfiles/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { 
  Edit as EditIcon,
  Add as AddIcon, 
} from '@mui/icons-material';
import { 
  UserWithCollection, 
  PerfumeEntry, 
  EntryType, 
  userApi, 
  perfumeEntriesApi 
} from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Displays a user profile and their perfume collection
 * Replaces the old CollectionDetail component
 */
export const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfile, setUserProfile] = useState<UserWithCollection | null>(null);
  const [entries, setEntries] = useState<PerfumeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user && userProfile && user.id === userProfile.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!username) {
          throw new Error('Username is required');
        }
        
        // Fetch user profile
        const profileData = await userApi.getUserProfile(username);
        setUserProfile(profileData);
        
        // Fetch user's entries
        const entriesData = await userApi.getUserEntries(username);
        setEntries(entriesData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !userProfile) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error">
            {error || 'User profile not found'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" component="h1">
                {userProfile.collectionName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" mt={1}>
                By: {userProfile.username}
              </Typography>
            </Box>
            {isOwner && (
              <Box>
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  component={RouterLink}
                  to="/profile/edit"
                  sx={{ mr: 1 }}
                >
                  Edit Collection
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/entries/new"
                >
                  Add Entry
                </Button>
              </Box>
            )}
          </Box>

          {userProfile.collectionDescription && (
            <Box mt={3}>
              <Typography variant="body1">
                {userProfile.collectionDescription}
              </Typography>
            </Box>
          )}
        </Paper>

        <Box mb={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Perfume Entries ({entries.length})
          </Typography>
          
          {entries.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1">
                This collection has no entries yet.
              </Typography>
              {isOwner && (
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/entries/new"
                  sx={{ mt: 2 }}
                >
                  Add your first entry
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {entries.map((entry) => (
                <Grid item xs={12} sm={6} md={4} key={entry.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h3">
                        {entry.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {entry.brand || 'Unknown brand'}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="body2">
                          Type: {entry.type === EntryType.Bottle ? 'Bottle' : 'Decant'}
                        </Typography>
                        <Typography variant="body2">
                          Volume: {entry.volume} ml
                        </Typography>
                        <Typography variant="body2">
                          Price per ml: ${entry.pricePerMl.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          Total Value: ${entry.totalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        component={RouterLink}
                        to={`/entries/${entry.id}`}
                      >
                        Details
                      </Button>
                      {isOwner && (
                        <Button 
                          size="small" 
                          component={RouterLink}
                          to={`/entries/${entry.id}/edit`}
                        >
                          Edit
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default UserProfile;