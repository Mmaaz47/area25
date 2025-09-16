// API Configuration
// For production, set VITE_API_URL environment variable in AWS Amplify

export const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'http://area25-simple.eba-b42mgv5j.eu-north-1.elasticbeanstalk.com/api'
    : '/api'
  );

export const API_BASE = API_URL;