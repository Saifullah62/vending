import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';  // Ensure your User model is in this location
import config from '../config/config.js';  // Ensure your config file exports JWT_SECRET

// Hashes a password using bcryptjs.
const hashPassword = async (password) => {
    try {
        // bcryptjs uses a callback, so we will make it return a Promise for consistency.
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Error hashing password');
    }
};

// Finds a user by their email address.
const findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw new Error('Error finding user by email');
    }
};

// Creates a new user in the database.
const createUser = async (userData) => {
    try {
        const newUser = new User(userData);
        return await newUser.save();
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Error creating user');
    }
};

// Registers a new user.
const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with that email.' });
        }

        // Hash the password and create a new user
        const hashedPassword = await hashPassword(password);
        const user = await createUser({ username, email, password_hash: hashedPassword });

        // Send success response
        res.status(201).json({ message: 'User registered successfully!', user });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message || 'Error registering user.' });
    }
};

// Logs in an existing user.
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' });

        // Send success response with token
        res.status(200).json({ message: 'Login successful!', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message || 'Error logging in.' });
    }
};

// Export the controller functions
export default {
    register,
    login
};
