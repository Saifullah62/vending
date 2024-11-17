const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    share_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShareInventory', required: true },
    transaction_type: { type: String, required: true },
    amount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
