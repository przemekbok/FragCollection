import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Simple API to get users with public entries
const getUsersWithPublicEntries = async () => {
  const response = await fetch('/api/users/public');
  if (!response.ok) {
    throw new Error('Failed to load users');
  }
  return await response.json();
};

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicUsers = async () => {
      try {
        setLoading(true);
        const users = await getUsersWithPublicEntries();
        setPublicUsers(users);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicUsers();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box 
        sx={{ 
          py: 8,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          FragCollection
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your personal perfume collection manager
        </Typography>
        <Box sx={{ mt: 4, mb: 6, maxWidth: 600 }}>
          <Typography variant="body1" paragraph>
            Track your perfume bottles and decants, calculate price per ml, get information from Fragrantica,
            and share your collection with others.
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          {user ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to={`/users/${user.username}`}
            >
              My Collection
            </Button>
          ) : (
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={Link}
                  to="/login"
                >
                  Login
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  component={Link}
                  to="/register"
                >
                  Register
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Manage Your Perfumes
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Create a personal collection of your perfumes. Track bottles and decants with volume and price information.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button 
                component={Link} 
                to={user ? `/users/${user.username}` : "/login"} 
                variant="outlined"
              >
                {user ? "My Collection" : "Login to Start"}
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Track Usage
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Keep track of your perfume inventory, including volume, price, and usage over time.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button 
                component={Link} 
                to="/explorer"
                variant="outlined"
              >
                Explore Collections
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Fragrantica Integration
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Add Fragrantica URLs to your entries to automatically fetch perfume information, notes, and images.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button 
                component={Link} 
                to={user ? "/entries/new" : "/register"} 
                variant="outlined"
              >
                {user ? "Add Perfume" : "Register Now"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Explore User Collections
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : publicUsers.length === 0 ? (
          <Typography align="center" color="textSecondary">
            No public collections available yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {publicUsers.map(user => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h3">
                      {user.collectionName}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      by {user.username}
                    </Typography>
                    {user.collectionDescription && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {user.collectionDescription.length > 100 
                          ? `${user.collectionDescription.substring(0, 100)}...` 
                          : user.collectionDescription}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/users/${user.username}`}
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

export default HomePage;