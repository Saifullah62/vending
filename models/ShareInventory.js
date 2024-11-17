import mongoose from 'mongoose';

// Define the schema for Share Inventory
const ShareInventorySchema = new mongoose.Schema({
    cardName: { type: String, required: true },
    sharePercentage: { type: Number, required: true, min: 0, max: 100 },
    marketValue: { type: Number, required: true, min: 0 },
    tier: { type: String, required: true, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] },
    available: { type: Boolean, default: true }
}, { timestamps: true });

// Error handling for mongoose connection
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB successfully');
});

/**
 * Safely handles database operations by catching errors.
 * @param {Function} operation - The database operation to perform.
 * @throws Will throw an error if the operation fails.
 */
const safeDatabaseOperation = async (operation) => {
    try {
        await operation();
    } catch (error) {
        console.error('Database operation failed:', error);
        throw new Error('Database operation failed');
    }
};

// Export the ShareInventory model and the safeDatabaseOperation function
export const ShareInventory = mongoose.model('ShareInventory', ShareInventorySchema);
export { safeDatabaseOperation };
