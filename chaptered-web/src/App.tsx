import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Library } from './pages/Library';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPassword } from './pages/ForgotPassword';
import { Discover } from './pages/Discover';
import { Profile } from './pages/Profile';
import { Clubs } from './pages/Clubs';
import { ClubDetail } from './pages/ClubDetail';
import { CreateClub } from './pages/CreateClub';
import { ClubSettings } from './pages/ClubSettings';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
            <Route path="/signup" element={<ErrorBoundary><SignupPage /></ErrorBoundary>} />
            <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<ErrorBoundary><Landing /></ErrorBoundary>} />
                  <Route path="/dashboard" element={<ErrorBoundary><ProtectedRoute><Dashboard /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/discover" element={<ErrorBoundary><Discover /></ErrorBoundary>} />
                  <Route path="/library" element={<ErrorBoundary><ProtectedRoute><Library /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/profile" element={<ErrorBoundary><ProtectedRoute><Profile /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/clubs" element={<ErrorBoundary><ProtectedRoute><Clubs /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/clubs/create" element={<ErrorBoundary><ProtectedRoute><CreateClub /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/clubs/:id/settings" element={<ErrorBoundary><ProtectedRoute><ClubSettings /></ProtectedRoute></ErrorBoundary>} />
                  <Route path="/clubs/:id" element={<ErrorBoundary><ProtectedRoute><ClubDetail /></ProtectedRoute></ErrorBoundary>} />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
