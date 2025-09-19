// Frontend Configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = isDevelopment ? 'http://localhost:4000/api' : 'https://api.6th-space.com/api';
export const VERSION = '1.0.0';
export const BUILD_DATE = '2025-09-18';

// Features
export const FEATURES = {
  toLocaleStringFixed: true,
  priceNullCheck: true,
  productUpsert: true,
  managerAuth: true
};