const mongoose = require('mongoose');

const UserInventorySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    share_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShareInventory', required: true },
    ownership_percentage: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('UserInventory', UserInventorySchema);
