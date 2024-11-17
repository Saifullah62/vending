import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Note: Add .js for ESM
import config from '../config/config.js'; // Note: Add .js for ESM
import nodemailer from 'nodemailer'; // New feature for sending emails
import { validationResult, body } from 'express-validator'; // New feature for input validation

/**
 * Hashes a password using bcryptjs.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 * @throws {Error} - Throws an error if hashing fails.
 */
const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 12); // Increased salt rounds for better security
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
 * Validates user input for registration and login.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
const validateInput = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
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

/**
 * Updates user information.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response to the client.
 */
export const updateUser = async (req, res) => {
    const { userId } = req;
    const updates = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated successfully!', user: updatedUser });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: error.message || 'Error updating user.' });
    }
};

/**
 * Deletes a user account.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response to the client.
 */
export const deleteUser = async (req, res) => {
    const { userId } = req;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully!' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: error.message || 'Error deleting user.' });
    }
};

/**
 * Sends a password reset email to the user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response to the client.
 */
export const sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a password reset token
        const resetToken = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' }); // Token valid for 1 hour

        // Send email (using nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: config.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${config.FRONTEND_URL}/reset-password?token=${resetToken}`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Password reset email sent successfully!' });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ error: error.message || 'Error sending password reset email.' });
    }
};

/**
 * Resets the user's password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Sends a response to the client.
 */
export const resetPassword = async (req, res) => {
    const { userId } = req;
    const { newPassword } = req.body;

    try {
        const hashedPassword = await hashPassword(newPassword);
        const updatedUser = await User.findByIdAndUpdate(userId, { passwordHash: hashedPassword }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: error.message || 'Error resetting password.' });
    }
};

/**
 * Middleware to validate user input for registration and login.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
export const validateUserInput = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Export the validation middleware for use in routes
export const userValidationRules = () => {
    return [
        body('username').notEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Email is not valid'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ];
};

/**
 * Middleware to validate user input for password reset.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
export const validatePasswordResetInput = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

/**
 * Validation rules for password reset.
 * @returns {Array} - Array of validation rules.
 */
export const passwordResetValidationRules = () => {
    return [
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    ];
};

