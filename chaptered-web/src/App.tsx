import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Library } from './pages/Library';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppLayout>
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Landing />
                </ErrorBoundary>
              }
            />
            <Route
              path="/library"
              element={
                <ErrorBoundary>
                  <Library />
              path="/login"
              element={
                <ErrorBoundary>
                  <LoginPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/signup"
              element={
                <ErrorBoundary>
                  <SignupPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/library"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
          </Routes>
        </AppLayout>
      </Router>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
