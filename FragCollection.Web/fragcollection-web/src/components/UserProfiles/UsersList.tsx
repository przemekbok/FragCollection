// src/components/UserProfiles/UsersList.tsx
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
  Chip,
  Fab,
  Tooltip,
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Add as AddIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { UserWithCollection, userApi } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

interface UsersListProps {
  publicOnly?: boolean;
}

/**
 * Displays a list of users with perfume collections
 * Replaces the old CollectionsList component
 */
export const UsersList: React.FC<UsersListProps> = ({ publicOnly = true }) => {
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
            Perfume Collections
          </Typography>
          {user && (
            <Tooltip title="Manage Your Collection">
              <Fab 
                color="primary" 
                aria-label="manage" 
                component={RouterLink} 
                to="/profile"
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          )}
        </Box>

        {error && (
          <Box mb={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {users.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" gutterBottom>
              No users with public collections found
            </Typography>
            {user && (
              <Button 
                variant="contained" 
                color="primary" 
                component={RouterLink} 
                to="/profile"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Set up your collection
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {users.map((userProfile) => (
              <Grid item xs={12} sm={6} md={4} key={userProfile.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h5" component="h2" gutterBottom>
                        {userProfile.collectionName}
                      </Typography>
                      <Chip 
                        icon={<PublicIcon />}
                        label="Public"
                        color="success"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {userProfile.collectionDescription || 'No description'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      By: {userProfile.username}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />}
                      component={RouterLink}
                      to={`/users/${userProfile.username}`}
                    >
                      View Collection
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

export default UsersList;