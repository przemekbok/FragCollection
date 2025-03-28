import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Chip
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { UserWithCollection, userApi } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfilesListProps {
  publicOnly?: boolean;
}

export const UserProfilesList: React.FC<UserProfilesListProps> = ({ publicOnly = true }) => {
  const [users, setUsers] = useState<UserWithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userApi.getUsersWithPublicEntries();
        setUsers(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            User Profiles
          </Typography>
        </Box>

        {error && (
          <Box mb={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {users.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" gutterBottom>
              No public profiles found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {users.map((userProfile) => (
              <Grid item xs={12} sm={6} md={4} key={userProfile.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h5" component="h2" gutterBottom>
                        {userProfile.username}
                      </Typography>
                      <Chip 
                        icon={<PublicIcon />}
                        label="Public"
                        color="success"
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {userProfile.collectionName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {userProfile.collectionDescription || 'No description'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />}
                      component={RouterLink}
                      to={`/users/${userProfile.username}`}
                    >
                      View Profile
                    </Button>
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

export default UserProfilesList;