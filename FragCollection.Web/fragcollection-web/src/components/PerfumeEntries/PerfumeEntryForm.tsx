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
  Paper
} from '@mui/material';
import { 
  EntryType, 
  PerfumeEntry, 
  perfumeEntriesApi 
} from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const PerfumeEntryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [entry, setEntry] = useState<Partial<PerfumeEntry>>({
    name: '',
    brand: '',
    type: EntryType.Bottle,
    volume: 100,
    pricePerMl: 0,
    isPublic: false,
    fragranticaUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [fragranticaLoading, setFragranticaLoading] = useState(false);
  const [computedTotalPrice, setComputedTotalPrice] = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
            fragranticaUrl: entryData.fragranticaUrl || ''
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
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
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
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditing && id) {
        await perfumeEntriesApi.updateEntry(id, entry as any);
      } else {
        await perfumeEntriesApi.createEntry(entry as any);
      }
      
      navigate(`/users/${user?.username}`);
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
                    onChange={handleSelectChange as any}
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
                  label="Make this entry public (visible to others)"
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

export default PerfumeEntryForm;