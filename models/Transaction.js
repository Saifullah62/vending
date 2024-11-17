import mongoose from 'mongoose';

/**
 * Transaction Schema for MongoDB using Mongoose.
 * This schema defines the structure of a transaction document in the database.
 */
const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shareId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShareInventory', required: true },
    transactionType: { type: String, enum: ['buy', 'sell'], required: true }, // Specifies the type of transaction
    amount: { type: Number, required: true, min: 0 } // Amount must be a non-negative number
}, { timestamps: true });

/**
 * Static method to find transactions based on a query.
 * @param {Object} query - The query object to filter transactions.
 * @returns {Promise<Array>} - A promise that resolves to an array of transactions.
 * @throws {Error} - Throws an error if the fetch operation fails.
 */
TransactionSchema.statics.findTransactions = async function(query) {
    try {
        return await this.find(query).lean();
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Could not fetch transactions.');
    }
};

// Export the Transaction model based on the defined schema
export default mongoose.model('Transaction', TransactionSchema);
