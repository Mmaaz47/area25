// API Configuration
// For production, set VITE_API_URL environment variable in AWS Amplify

// Use local backend for development, production URL for deployment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = isDevelopment ? 'http://localhost:4000/api' : 'https://api.6th-space.com/api';

export const API_BASE = API_URL;