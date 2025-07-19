import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { useAuth } from './components/AuthProvider';

function App() {
  const { user, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If user is authenticated and wants dashboard, show it
  if (user && showDashboard) {
    return <Dashboard />;
  }

  const handleEnter = () => {
    if (user) {
      // If user is logged in, show dashboard option
      setShowDashboard(true);
    } else {
      // Navigate to the actual home.html page
      window.location.href = '/home.html';
    }
  };

  return (
    <div className="App">
      <LandingPage onEnter={handleEnter} />
    </div>
  );
}

export default App;