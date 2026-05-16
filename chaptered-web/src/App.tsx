import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { LoginPage } from '@pages/LoginPage';
import { SignupPage } from '@pages/SignupPage';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { Header } from '@components/shared/Header';

/**
 * Placeholder Dashboard Page (will create real one in Day 4)
 */
const DashboardPage = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Chaptered! 📚</h1>
    <p className="text-gray-600 mb-4">Your reading journey starts here.</p>
    <p className="text-sm text-gray-500">Login/Signup components are working!</p>
  </div>
);

/**
 * Main App Component
 * Routes requests to Login, Signup, or Dashboard based on auth status
 */
function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      {/* Show header only when logged in */}
      {isAuthenticated && <Header />}
      
      <Routes>
        {/* If NOT logged in, show public routes */}
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Any other route → redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* If logged in, show protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Any other route → redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;