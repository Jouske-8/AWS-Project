import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- ADD THIS LINE ---
import './config/awsConfig.js'; // This runs the Amplify.configure()
// --- END ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);