const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    wallet_balance: { type: Number, default: 0.0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
