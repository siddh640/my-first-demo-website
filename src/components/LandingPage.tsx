import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div 
      id="landing-page" 
      className="vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(rgba(13, 110, 253, 0.8), rgba(13, 110, 253, 0.95)), url("https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg") no-repeat center center/cover',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000
      }}
    >
      <div className="text-center animate__animated animate__fadeIn">
        <h1 className="landing-title" style={{ fontSize: '3.5rem', fontWeight: 700, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', color: 'white' }}>
          Let's Learn Fluent English
        </h1>
        <p className="lead text-white mt-3">American Institute - Empowering through language</p>
        <button 
          id="enter-btn" 
          className="btn btn-light btn-lg mt-4 px-5 animate__animated animate__pulse animate__infinite"
          style={{ transition: 'transform 0.3s ease' }}
          onClick={onEnter}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default LandingPage;