import React, { useState } from 'react';
import LandingPage from './components/LandingPage';

function App() {
  const [showHomePage, setShowHomePage] = useState(false);

  const handleEnter = () => {
    // Navigate to the actual home.html page
    window.location.href = '/home.html';
  };

  return (
    <div className="App">
      <LandingPage onEnter={handleEnter} />
    </div>
  );
}

export default App;