import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Note: Add .js for ESM
import config from '../config/config.js'; // Note: Add .js for ESM

/**
 * Hashes a password using bcryptjs.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if hashing fails.
 */
const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10); // bcryptjs uses a salt round of 10 by default // Increased salt rounds for better security
    } catch (error) {
        console.error('Error during password hashing:', error);
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
        const newUser = await createUser({ username, email, passwordHash: hashedPassword });
        res.status(201).json({ message: 'User registered successfully!', userId: newUser._id });
    } catch (error) {
        console.error('Registration error:', error);
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
        if (user && await bcrypt.compare(password, user.passwordHash)) {
            const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '2h' }); // Extended token validity to 2 hours
            return res.json({ message: 'Login successful!', token });
        }
        res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message || 'Error logging in.' });
    }
};

/**
 * Middleware to verify JWT and protect routes.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(403).json({ error: 'Invalid token, authorization denied' });
    }
};
