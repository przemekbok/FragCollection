import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

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
              to="/collections"
            >
              View My Collections
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
              Manage Collections
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Create multiple collections to organize your perfumes by season, occasion, or any category you like.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button 
                component={Link} 
                to={user ? "/collections" : "/login"} 
                variant="outlined"
              >
                {user ? "My Collections" : "Login to Start"}
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Track Bottles & Decants
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Keep track of your perfume inventory, including volume, price, and usage over time.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button 
                component={Link} 
                to="/collections/public" 
                variant="outlined"
              >
                Browse Public Collections
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
                to={user ? "/collections/new" : "/register"} 
                variant="outlined"
              >
                {user ? "Create Collection" : "Register Now"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;