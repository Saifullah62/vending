import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config();

/**
 * Connect to MongoDB database.
 * @async
 * @throws Will throw an error if the connection fails.
 */
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        // Check if the MongoDB URI is defined
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables.');
        }

        // Connect to MongoDB with specified options
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.error(err.stack);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
