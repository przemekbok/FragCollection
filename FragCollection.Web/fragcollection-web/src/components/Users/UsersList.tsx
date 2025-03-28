import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Pagination
} from '@mui/material';
import { UserWithCollection, userApi } from '../../services/apiService';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserWithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 9; // Users per page

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userApi.getUsersWithPublicEntries(page, pageSize);
        setUsers(data);
        
        // For demonstration purposes, we'll set a fixed number of pages
        // In a real app, you would get this from the API
        setTotalPages(Math.ceil(data.length / pageSize) || 1);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

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
        <Typography variant="h4" component="h1" gutterBottom>
          Browse User Collections
        </Typography>
        
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}

        {users.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" gutterBottom>
              No users with public collections found
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {users.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {user.collectionName}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        by {user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.collectionDescription || 'No description provided'}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        component={Link} 
                        to={`/users/${user.username}`}
                        color="primary"
                      >
                        View Collection
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default UsersList;