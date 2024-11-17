import mongoose from 'mongoose';

// Define the schema for user inventory
const UserInventorySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        shareId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShareInventory', required: true },
        ownershipPercentage: { type: Number, required: true, min: 0, max: 100 }
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Error handling for schema validation
UserInventorySchema.post('save', (error, doc, next) => {
    if (error) {
        console.error('Error saving UserInventory:', error);
        next(new Error('Failed to save UserInventory.')); // Custom error message
    } else {
        next(); // Proceed to the next middleware if no error
    }
});

// Export the model with a descriptive name
const UserInventory = mongoose.model('UserInventory', UserInventorySchema);

export default UserInventory;
