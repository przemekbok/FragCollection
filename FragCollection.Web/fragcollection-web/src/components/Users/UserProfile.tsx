import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip,
  Divider, 
  CircularProgress,
  Paper
} from '@mui/material';
import { 
  Public as PublicIcon,
  Lock as PrivateIcon,
  Spa as SpaIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userApi, perfumeEntriesApi, PerfumeEntry, EntryType, UserWithCollection } from '../../services/apiService';

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserWithCollection | null>(null);
  const [entries, setEntries] = useState<PerfumeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!username) {
          setError('Username not provided');
          return;
        }

        // Fetch user profile data
        const userData = await userApi.getUserProfile(username);
        setUser(userData);
        
        // Fetch user entries (will return all entries for owner, public only for others)
        const entriesData = await userApi.getUserEntries(username);
        setEntries(entriesData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, currentUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error">
            {error || 'User not found'}
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/"
            sx={{ mt: 2 }}
          >
            Go to Homepage
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" component="h1">
                {user.collectionName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                by {user.username}
              </Typography>
            </Box>
            {isOwnProfile && (
              <Button 
                variant="outlined" 
                component={Link} 
                to="/profile/edit"
              >
                Edit Collection
              </Button>
            )}
          </Box>
          
          {user.collectionDescription && (
            <Typography variant="body1" sx={{ mt: 2 }}>
              {user.collectionDescription}
            </Typography>
          )}
        </Paper>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            {isOwnProfile ? 'My Entries' : 'Perfume Entries'}
            {!isOwnProfile && <Chip 
              icon={<PublicIcon />} 
              label="Public only" 
              size="small" 
              color="info" 
              sx={{ ml: 2 }} 
            />}
          </Typography>
          
          {isOwnProfile && (
            <Button 
              variant="contained" 
              color="primary"
              component={Link}
              to="/entries/new"
            >
              Add New Entry
            </Button>
          )}
        </Box>

        {entries.length === 0 ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              {isOwnProfile 
                ? "You don't have any entries yet. Add your first perfume!" 
                : "This user hasn't shared any perfumes yet."}
            </Typography>
            {isOwnProfile && (
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                to="/entries/new"
                sx={{ mt: 2 }}
              >
                Add First Entry
              </Button>
            )}
          </Paper>
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
                      <Box>
                        <Chip 
                          icon={entry.type === EntryType.Bottle ? <SpaIcon /> : <ScienceIcon />}
                          label={entry.type === EntryType.Bottle ? 'Bottle' : 'Decant'}
                          size="small"
                          color={entry.type === EntryType.Bottle ? 'primary' : 'secondary'}
                        />
                        {isOwnProfile && (
                          <Chip 
                            icon={entry.isPublic ? <PublicIcon /> : <PrivateIcon />}
                            label={entry.isPublic ? 'Public' : 'Private'}
                            size="small"
                            color={entry.isPublic ? 'success' : 'default'}
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {entry.brand || 'Unknown brand'}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box>
                      <Typography variant="body2">
                        Volume: {entry.volume} ml
                      </Typography>
                      <Typography variant="body2">
                        Price per ml: ${entry.pricePerMl.toFixed(2)}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                        Total Value: ${entry.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={Link}
                      to={`/entries/${entry.id}`}
                    >
                      Details
                    </Button>
                    {isOwnProfile && (
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

export default UserProfile;