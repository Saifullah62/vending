import express from 'express';
import { register, login } from '../controllers/userController.js';  // Named imports

const router = express.Router();

/**
 * @route POST /register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
    try {
        await register(req, res);
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
        await login(req, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
});

export default router;
