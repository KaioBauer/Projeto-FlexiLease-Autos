// src/routes/authRoutes.ts
import express from 'express';
import { authenticateUser } from '../controllers/authController';

const router = express.Router();

router.post('/auth', authenticateUser);

export default router;
