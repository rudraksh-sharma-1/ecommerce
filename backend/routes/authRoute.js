import express from 'express';
import { signup, login, logout, getMe } from '../controller/authController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
