const express = require('express');
const connectDB = require('./config/config');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

// Initialize express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
connectDB();

// Define API routes
app.use('/api', userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
