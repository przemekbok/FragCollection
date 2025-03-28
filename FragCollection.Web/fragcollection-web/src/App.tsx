import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import Login, { Register } from './components/Login';
import { CollectionsList, CollectionForm, CollectionDetail } from './components/Collections/CollectionsList';
import PerfumeEntryForm, { PerfumeEntryDetail } from './components/PerfumeEntries/PerfumeEntryForm';
import NotFound from './components/NotFound';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // Purple - reminiscent of perfume
      light: '#d05ce3',
      dark: '#6a0080',
    },
    secondary: {
      main: '#2196f3', // Blue
      light: '#6ec6ff',
      dark: '#0069c0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
    },
  },
});

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Collection Routes */}
            <Route 
              path="/collections" 
              element={
                <ProtectedRoute>
                  <CollectionsList />
                </ProtectedRoute>
              } 
            />
            <Route path="/collections/public" element={<CollectionsList publicOnly />} />
            <Route 
              path="/collections/new" 
              element={
                <ProtectedRoute>
                  <CollectionForm />
                </ProtectedRoute>
              } 
            />
            <Route path="/collections/:id" element={<CollectionDetail />} />
            <Route 
              path="/collections/:id/edit" 
              element={
                <ProtectedRoute>
                  <CollectionForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Perfume Entry Routes */}
            <Route 
              path="/collections/:collectionId/entries/new" 
              element={
                <ProtectedRoute>
                  <PerfumeEntryForm />
                </ProtectedRoute>
              } 
            />
            <Route path="/entries/:id" element={<PerfumeEntryDetail />} />
            <Route 
              path="/entries/:id/edit" 
              element={
                <ProtectedRoute>
                  <PerfumeEntryForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;