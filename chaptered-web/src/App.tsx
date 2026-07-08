
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Library } from './pages/Library';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
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
              </ErrorBoundary>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
