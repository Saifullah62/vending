const express = require('express');
const connectDB = require('./config/config');
require('dotenv').config();https://github.com/Saifullah62/vending/tree/main
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');

// Initialize express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Use CORS middleware for cross-origin requests
app.use(cors());

// Connect to MongoDB
connectDB();

// Define API routes
app.use('/api', userRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error:', err);
    process.exit(1);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optional: process.exit(1);
});
