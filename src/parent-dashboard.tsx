import React from 'react';
import { createRoot } from 'react-dom/client';
import ParentDashboard from './components/ParentDashboard';

// Initialize the React component
const container = document.getElementById('parent-dashboard-root');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(ParentDashboard));
}