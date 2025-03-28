import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import Login, { Register } from './components/Login';
import NotFound from './components/NotFound';

// User Profile Components
import UserProfile from './components/Users/UserProfile';
import UsersList from './components/Users/UsersList';
import CollectionSettings from './components/Users/CollectionSettings';

// Perfume Entry Components
import PerfumeEntryForm from './components/PerfumeEntries/PerfumeEntryForm';
import PerfumeEntryDetail from './components/PerfumeEntries/PerfumeEntryDetail';

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
  const { user } = useAuth();

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
            
            {/* User Profile Routes */}
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/:username" element={<UserProfile />} />
            <Route 
              path="/profile/edit" 
              element={
                <ProtectedRoute>
                  <CollectionSettings />
                </ProtectedRoute>
              } 
            />
            
            {/* Perfume Entry Routes */}
            <Route 
              path="/entries/new" 
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
            
            {/* Redirect old routes to new structure */}
            <Route path="/collections" element={<Navigate to={user ? `/users/${user.username}` : "/users"} replace />} />
            <Route path="/collections/public" element={<Navigate to="/users" replace />} />
            <Route path="/collections/new" element={<Navigate to="/profile/edit" replace />} />
            <Route path="/collections/:id" element={<Navigate to="/users" replace />} />
            <Route path="/collections/:id/edit" element={<Navigate to="/profile/edit" replace />} />
            <Route path="/collections/:id/entries/new" element={<Navigate to="/entries/new" replace />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;