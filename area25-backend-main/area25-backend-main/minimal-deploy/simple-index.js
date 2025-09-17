const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Area25 Backend API',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});