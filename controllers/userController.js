const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

/**
 * Hashes a password using bcrypt.
 */
const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        throw new Error('Error hashing password');
    }
};

/**
 * Finds a user by their email address.
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
 */
const register = async (req, res) => {
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
 */
const login = async (req, res) => {
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

// Named exports for each function
module.exports = {
    register,
    login
};

// Default export as an object containing all functions
export default {
    register,
    login
};
