import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Library } from './pages/Library';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppLayout>
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
                </ErrorBoundary>
              }
            />
          </Routes>
        </AppLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
