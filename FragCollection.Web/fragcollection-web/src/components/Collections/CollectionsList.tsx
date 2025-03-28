// src/components/Collections/CollectionsList.tsx
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
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Fab,
  Tooltip,
  CircularProgress,
  Chip,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Visibility as ViewIcon,
  Add as AddIcon,
  Public as PublicIcon,
  Lock as PrivateIcon
} from '@mui/icons-material';
import { Collection, collectionsApi, PerfumeEntry, EntryType, perfumeEntriesApi } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

interface CollectionsListProps {
  publicOnly?: boolean;
}

const CollectionsList: React.FC<CollectionsListProps> = ({ publicOnly = false }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        let data: Collection[];
        
        if (publicOnly) {
          data = await collectionsApi.getPublicCollections();
        } else {
          if (!user) {
            navigate('/login');
            return;
          }
          data = await collectionsApi.getUserCollections();
        }
        
        setCollections(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [publicOnly, user, navigate]);

  const handleDeleteClick = (collection: Collection) => {
    setCollectionToDelete(collection);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return;
    
    try {
      await collectionsApi.deleteCollection(collectionToDelete.id);
      setCollections(collections.filter(c => c.id !== collectionToDelete.id));
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete collection');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCollectionToDelete(null);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            {publicOnly ? 'Public Collections' : 'My Collections'}
          </Typography>
          {!publicOnly && (
            <Tooltip title="Add Collection">
              <Fab 
                color="primary" 
                aria-label="add" 
                component={RouterLink} 
                to="/collections/new"
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

        {collections.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" gutterBottom>
              {publicOnly 
                ? 'No public collections found' 
                : 'You don\'t have any collections yet'}
            </Typography>
            {!publicOnly && (
              <Button 
                variant="contained" 
                color="primary" 
                component={RouterLink} 
                to="/collections/new"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Create your first collection
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {collections.map((collection) => (
              <Grid item xs={12} sm={6} md={4} key={collection.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h5" component="h2" gutterBottom>
                        {collection.name}
                      </Typography>
                      <Chip 
                        icon={collection.isPublic ? <PublicIcon /> : <PrivateIcon />}
                        label={collection.isPublic ? 'Public' : 'Private'}
                        color={collection.isPublic ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {collection.description || 'No description'}
                    </Typography>
                    {publicOnly && (
                      <Typography variant="caption" color="text.secondary">
                        By: {collection.username}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block" color="text.secondary">
                      Created: {new Date(collection.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Updated: {new Date(collection.updatedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />}
                      component={RouterLink}
                      to={`/collections/${collection.id}`}
                    >
                      View
                    </Button>
                    
                    {(!publicOnly || (user && collection.userId === user.id)) && (
                      <>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          component={RouterLink}
                          to={`/collections/${collection.id}/edit`}
                        >
                          Edit
                        </Button>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteClick(collection)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the collection "{collectionToDelete?.name}"? 
              This action cannot be undone and will delete all perfume entries in this collection.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

// Collection Form Component
export const CollectionForm: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  useEffect(() => {
    const fetchCollection = async () => {
      if (!isEditing) return;

      try {
        setLoading(true);
        const collection = await collectionsApi.getCollection(id);
        setName(collection.name);
        setDescription(collection.description);
        setIsPublic(collection.isPublic);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load collection details');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        await collectionsApi.updateCollection(id, name, description, isPublic);
      } else {
        await collectionsApi.createCollection(name, description, isPublic);
      }

      navigate('/collections');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
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
          {isEditing ? 'Edit Collection' : 'Create New Collection'}
        </Typography>

        {error && (
          <Box mb={4}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Collection Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                name="isPublic"
                color="primary"
                disabled={loading}
              />
            }
            label="Make this collection public"
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/collections')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Create')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

// Collection Detail Component
export const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [entries, setEntries] = useState<PerfumeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const collectionData = await collectionsApi.getCollection(id as string);
        setCollection(collectionData);
        
        const entriesData = await perfumeEntriesApi.getEntriesByCollection(id as string);
        setEntries(entriesData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load collection');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const isOwner = user && collection && user.id === collection.userId;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !collection) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error">
            {error || 'Collection not found'}
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1">
              {collection.name}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <Chip 
                icon={collection.isPublic ? <PublicIcon /> : <PrivateIcon />}
                label={collection.isPublic ? 'Public' : 'Private'}
                color={collection.isPublic ? 'success' : 'default'}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                By: {collection.username}
              </Typography>
            </Box>
          </Box>
          {isOwner && (
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                component={RouterLink}
                to={`/collections/${collection.id}/edit`}
                sx={{ mr: 1 }}
              >
                Edit Collection
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />}
                component={RouterLink}
                to={`/collections/${collection.id}/entries/new`}
              >
                Add Entry
              </Button>
            </Box>
          )}
        </Box>

        {collection.description && (
          <Box mb={4}>
            <Typography variant="body1">
              {collection.description}
            </Typography>
          </Box>
        )}

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
                  to={`/collections/${collection.id}/entries/new`}
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