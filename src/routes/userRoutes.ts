import { Router } from 'express';
const { registerUser } = require('../controllers/userController');
const router = Router();

router.post('/user', registerUser);

export default router;
