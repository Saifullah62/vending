const mongoose = require('mongoose');

const ShareInventorySchema = new mongoose.Schema({
    card_name: { type: String, required: true },
    share_percentage: { type: Number, required: true },
    market_value: { type: Number, required: true },
    tier: { type: String, required: true },
    available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ShareInventory', ShareInventorySchema);
