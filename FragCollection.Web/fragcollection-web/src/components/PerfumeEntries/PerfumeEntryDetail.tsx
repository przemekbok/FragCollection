import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { EntryType, PerfumeEntry, perfumeEntriesApi } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

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

// Main PerfumeEntryDetail component
const PerfumeEntryDetail: React.FC = () => {
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

  const isOwner = user && entry && entry.userId === user.id;

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
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Visibility
                    </Typography>
                    <Typography variant="body1">
                      {entry.isPublic ? 'Public' : 'Private'}
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
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
                {isOwner && (
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
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

export default PerfumeEntryDetail;