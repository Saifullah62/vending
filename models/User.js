import mongoose from 'mongoose';

/**
 * User Schema definition for MongoDB using Mongoose.
 * This schema defines the structure of user documents in the database.
 */
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    walletBalance: { type: Number, default: 0.0 }
}, { timestamps: true });

/**
 * User model static methods.
 */
UserSchema.statics = {
    /**
     * Finds a user by their email address.
     * @param {string} email - The email address of the user to find.
     * @returns {Promise<Object>} - The user object if found.
     * @throws {Error} - Throws an error if the user is not found or if the database query fails.
     */
    async findUserByEmail(email) {
        try {
            const user = await this.findOne({ email }).lean();
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new Error('Database query failed');
        }
    }
};

/**
 * User model definition.
 */
const User = mongoose.model('User', UserSchema);

export default User;
