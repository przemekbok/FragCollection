// src/components/PerfumeEntries/PerfumeEntryForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Grid,
  Paper,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { EntryType, PerfumeEntry, Collection, perfumeEntriesApi, collectionsApi, PerfumeInfo, NoteType } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const PerfumeEntryForm: React.FC = () => {
  const { id, collectionId } = useParams<{ id: string; collectionId: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [entry, setEntry] = useState<Partial<PerfumeEntry>>({
    name: '',
    brand: '',
    type: EntryType.Bottle,
    volume: 100,
    pricePerMl: 0,
    isPublic: false,
    fragranticaUrl: '',
    collectionId: collectionId || ''
  });
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [fragranticaLoading, setFragranticaLoading] = useState(false);
  const [computedTotalPrice, setComputedTotalPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user collections
        const collectionsData = await collectionsApi.getUserCollections();
        setCollections(collectionsData);
        
        // If editing an entry, fetch its data
        if (isEditing && id) {
          const entryData = await perfumeEntriesApi.getEntry(id);
          setEntry({
            name: entryData.name,
            brand: entryData.brand || '',
            type: entryData.type,
            volume: entryData.volume,
            pricePerMl: entryData.pricePerMl,
            isPublic: entryData.isPublic,
            fragranticaUrl: entryData.fragranticaUrl || '',
            collectionId: entryData.collectionId
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  useEffect(() => {
    // Calculate total price whenever volume or pricePerMl changes
    if (entry.volume && entry.pricePerMl) {
      setComputedTotalPrice(entry.volume * entry.pricePerMl);
    } else {
      setComputedTotalPrice(0);
    }
  }, [entry.volume, entry.pricePerMl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setEntry(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Special handler for Material UI Select components
  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    if (name) {
      setEntry(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEntry(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entry.collectionId) {
      setError('Please select a collection');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditing && id) {
        await perfumeEntriesApi.updateEntry(id, entry as any);
      } else {
        await perfumeEntriesApi.createEntry(entry as any);
      }
      
      navigate(`/collections/${entry.collectionId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
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
          {isEditing ? 'Edit Perfume Entry' : 'Add New Perfume Entry'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="collection-label">Collection</InputLabel>
                  <Select
                    labelId="collection-label"
                    id="collectionId"
                    name="collectionId"
                    value={entry.collectionId}
                    onChange={handleSelectChange}
                    label="Collection"
                    disabled={loading || collections.length === 0}
                  >
                    {collections.map((collection) => (
                      <MenuItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  name="name"
                  label="Perfume Name"
                  value={entry.name}
                  onChange={handleChange}
                  disabled={loading || fragranticaLoading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="brand"
                  name="brand"
                  label="Brand"
                  value={entry.brand}
                  onChange={handleChange}
                  disabled={loading || fragranticaLoading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    name="type"
                    value={entry.type}
                    onChange={handleSelectChange}
                    label="Type"
                    disabled={loading}
                  >
                    <MenuItem value={EntryType.Bottle}>Bottle</MenuItem>
                    <MenuItem value={EntryType.Decant}>Decant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="volume"
                  name="volume"
                  label="Volume (ml)"
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ml</InputAdornment>,
                  }}
                  value={entry.volume}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="pricePerMl"
                  name="pricePerMl"
                  label="Price per milliliter"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={entry.pricePerMl}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Box bgcolor="grey.100" p={2} borderRadius={1}>
                  <Typography variant="subtitle1">
                    Total Value: ${computedTotalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="fragranticaUrl"
                  name="fragranticaUrl"
                  label="Fragrantica URL"
                  placeholder="https://www.fragrantica.com/perfume/..."
                  value={entry.fragranticaUrl}
                  onChange={handleChange}
                  disabled={loading || fragranticaLoading}
                  helperText="Adding a Fragrantica URL will automatically fetch additional information"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={entry.isPublic}
                      onChange={handleCheckboxChange}
                      name="isPublic"
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label="Make this entry public"
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || fragranticaLoading}
                  >
                    {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Add')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

// PerfumeEntry Detail Component
export const PerfumeEntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<PerfumeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const entryData = await perfumeEntriesApi.getEntry(id);
        setEntry(entryData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load entry details');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleUpdateVolume = async (newVolume: number) => {
    try {
      if (!entry || !id) return;
      
      await perfumeEntriesApi.updateEntryVolume(id, newVolume);
      
      // Update local state
      setEntry(prev => {
        if (!prev) return null;
        return {
          ...prev,
          volume: newVolume,
          totalPrice: newVolume * prev.pricePerMl
        };
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update volume');
    }
  };

  const isOwner = user && entry && entry.collectionId === user.id;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !entry) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography color="error">
            {error || 'Entry not found'}
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
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {entry.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {entry.brand || 'Unknown brand'}
                  </Typography>
                </Box>
                <Chip 
                  label={entry.type === EntryType.Bottle ? 'Bottle' : 'Decant'}
                  color={entry.type === EntryType.Bottle ? 'primary' : 'secondary'}
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Volume
                    </Typography>
                    <Typography variant="body1">
                      {entry.volume} ml
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Price per ml
                    </Typography>
                    <Typography variant="body1">
                      ${entry.pricePerMl.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${entry.totalPrice.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {isOwner && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>Update Volume</Typography>
                  <VolumeUpdateForm 
                    currentVolume={entry.volume} 
                    onUpdate={handleUpdateVolume} 
                  />
                </Box>
              )}

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/collections/${entry.collectionId}`)}
                >
                  Back to Collection
                </Button>
                {isOwner && (
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to={`/entries/${entry.id}/edit`}
                  >
                    Edit Entry
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {entry.perfumeInfo && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Fragrantica Information
                </Typography>
                
                {entry.perfumeInfo.imageUrl && (
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <img 
                      src={entry.perfumeInfo.imageUrl} 
                      alt={entry.perfumeInfo.name} 
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
                
                <Typography variant="h6">
                  {entry.perfumeInfo.name} by {entry.perfumeInfo.brand}
                </Typography>
                
                {entry.perfumeInfo.description && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      {entry.perfumeInfo.description}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Notes:</Typography>
                  
                  {entry.perfumeInfo.topNotes.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Top Notes:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {entry.perfumeInfo.topNotes.map(note => (
                          <Chip key={note.id} label={note.name} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {entry.perfumeInfo.middleNotes.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Middle Notes:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {entry.perfumeInfo.middleNotes.map(note => (
                          <Chip key={note.id} label={note.name} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {entry.perfumeInfo.baseNotes.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Base Notes:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {entry.perfumeInfo.baseNotes.map(note => (
                          <Chip key={note.id} label={note.name} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="outlined"
                    href={entry.perfumeInfo.fragranticaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Fragrantica
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

// Volume update mini-form component
interface VolumeUpdateFormProps {
  currentVolume: number;
  onUpdate: (newVolume: number) => Promise<void>;
}

const VolumeUpdateForm: React.FC<VolumeUpdateFormProps> = ({ currentVolume, onUpdate }) => {
  const [volume, setVolume] = useState(currentVolume);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (volume === currentVolume) return;
    
    try {
      setLoading(true);
      setError(null);
      await onUpdate(volume);
    } catch (err: any) {
      setError(err.message || 'Failed to update volume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={8} sm={6}>
          <TextField
            required
            fullWidth
            id="update-volume"
            label="New Volume"
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">ml</InputAdornment>,
            }}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            disabled={loading}
            size="small"
          />
        </Grid>
        <Grid item xs={4} sm={6}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || volume === currentVolume}
            size="medium"
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerfumeEntryForm;