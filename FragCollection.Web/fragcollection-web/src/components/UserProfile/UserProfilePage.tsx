import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  Paper
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { 
  PerfumeEntry, 
  EntryType, 
  perfumeEntriesApi 
} from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

// New API call to get user profile and entries
const getUserProfile = async (username: string) => {
  const response = await fetch(`/api/users/${username}`);
  if (!response.ok) {
    throw new Error('Failed to load user profile');
  }
  return await response.json();
};

const getUserEntries = async (username: string) => {
  const response = await fetch(`/api/users/${username}/entries`);
  if (!response.ok) {
    throw new Error('Failed to load user entries');
  }
  return await response.json();
};

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [entries, setEntries] = useState<PerfumeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isOwner = user && userProfile && user.username === username;

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile and entries in parallel
        const [profileData, entriesData] = await Promise.all([
          getUserProfile(username),
          getUserEntries(username)
        ]);
        
        setUserProfile(profileData);
        setEntries(entriesData);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading data');
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
          <Typography color="error" variant="h5" gutterBottom>
            {error || 'User not found'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {userProfile.collectionName}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            by {userProfile.username}
          </Typography>
          
          {userProfile.collectionDescription && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              {userProfile.collectionDescription}
            </Typography>
          )}
          
          {isOwner && (
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                to="/profile/edit"
              >
                Edit Collection Settings
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                to="/entries/new"
                sx={{ ml: 2 }}
              >
                Add New Entry
              </Button>
            </Box>
          )}
        </Paper>

        <Typography variant="h5" component="h2" gutterBottom>
          {isOwner ? 'Your Perfume Entries' : 'Perfume Entries'}
          {isOwner && entries.some(e => !e.isPublic) && (
            <Typography variant="caption" sx={{ ml: 2 }}>
              (Private entries are only visible to you)
            </Typography>
          )}
        </Typography>

        {entries.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" gutterBottom color="textSecondary">
              {isOwner 
                ? 'You have no perfume entries yet' 
                : 'This user has no public entries'}
            </Typography>
            {isOwner && (
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                to="/entries/new"
                sx={{ mt: 2 }}
              >
                Add Your First Perfume
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {entries.map((entry) => (
              <Grid item xs={12} sm={6} md={4} key={entry.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h3">
                        {entry.name}
                      </Typography>
                      <Box>
                        {!entry.isPublic && isOwner && (
                          <Chip 
                            label="Private" 
                            size="small"
                            color="default"
                            sx={{ mr: 1 }}
                          />
                        )}
                        <Chip 
                          label={entry.type === EntryType.Bottle ? 'Bottle' : 'Decant'}
                          size="small"
                          color={entry.type === EntryType.Bottle ? 'primary' : 'secondary'}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {entry.brand || 'Unknown brand'}
                    </Typography>
                    
                    <Box mt={2}>
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
                      startIcon={<ViewIcon />}
                      component={Link}
                      to={`/entries/${entry.id}`}
                    >
                      Details
                    </Button>
                    {isOwner && (
                      <Button 
                        size="small"
                        component={Link}
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
    </Container>
  );
};

export default UserProfilePage;