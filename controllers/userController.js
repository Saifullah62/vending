import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Note: Add .js for ESM
import config from '../config/config.js'; // Note: Add .js for ESM

import bcrypt from 'bcryptjs';

/**
 * Hashes a password using bcryptjs.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if hashing fails.
 */
const hashPassword = async (password) => {
    try {
        console.log('Attempting to hash the password...');
        return await bcrypt.hash(password, 10); // Use bcryptjs here
    } catch (error) {
        console.error('Error during password hashing:', error); // Provide more information
        throw new Error('Error hashing password');
    }
};

/**
 * Finds a user by their email address.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<User|null>} - The user object if found, otherwise null.
 * @throws {Error} - Throws an error if the search fails.
 */
const findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        throw new Error('Error finding user by email');
    }
};

/**
 * Creates a new user in the database.
 * @param {Object} userData - The data of the user to create.
 * @returns {Promise<User>} - The created user object.
 * @throws {Error} - Throws an error if user creation fails.
 */
const createUser = async (userData) => {
    try {
        return await new User(userData).save();
    } catch (error) {
        throw new Error('Error creating user');
    }
};

/**
 * Registers a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response to the client.
 */
export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with that email.' });
        }

        const hashedPassword = await hashPassword(password);
        await createUser({ username, email, password_hash: hashedPassword });
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error registering user.' });
    }
};

/**
 * Logs in a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response to the client.
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: 'Login successful!', token });
        }
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error logging in.' });
    }
};
