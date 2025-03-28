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
  Divider
} from '@mui/material';
import { 
  Edit as EditIcon,
  Add as AddIcon,
  Public as PublicIcon,
  Lock as PrivateIcon
} from '@mui/icons-material';
import { UserWithCollection, PerfumeEntry, EntryType, userApi, perfumeEntriesApi } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

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
      if (!username) return;
      
      try {
        setLoading(true);
        // Get user profile
        const profileData = await userApi.getUserProfile(username);
        setUserProfile(profileData);
        
        // Get entries for the user
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
        {/* User profile header */}
        <Box mb={4}>
          <Typography variant="h4" component="h1">
            {userProfile.username}'s Profile
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom mt={2}>
            {userProfile.collectionName}
          </Typography>
          
          {userProfile.collectionDescription && (
            <Typography variant="body1" mt={1}>
              {userProfile.collectionDescription}
            </Typography>
          )}
          
          {isOwner && (
            <Box mt={3}>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                component={RouterLink}
                to="/collection/settings"
                sx={{ mr: 2 }}
              >
                Edit Collection Info
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
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Perfume entries */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Perfume Entries ({entries.length})
          </Typography>
          
          {entries.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1">
                {isOwner 
                  ? "You don't have any entries in your collection yet." 
                  : "This user doesn't have any public entries yet."}
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
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" component="h3">
                          {entry.name}
                        </Typography>
                        <Chip 
                          icon={entry.isPublic ? <PublicIcon /> : <PrivateIcon />}
                          label={entry.isPublic ? 'Public' : 'Private'}
                          color={entry.isPublic ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
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