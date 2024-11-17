import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

/**
 * @route POST /register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
    try {
        const result = await userController.register(req.body);
        res.status(201).json({ message: 'User registered successfully', data: result });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

/**
 * @route POST /login
 * @desc Log in an existing user
 * @access Public
 */
router.post('/login', async (req, res) => {
    try {
        const result = await userController.login(req.body);
        res.status(200).json({ message: 'User logged in successfully', data: result });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
});

export default router;
