import { Router } from 'express';
import { authenticateToken } from '../middlewares/authenticateToken';
import {
  registerUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from '../controllers/userController';

const router = Router();

router.post('/user', registerUser);
router.put('/user/:id', authenticateToken, updateUser);
router.get('/user', authenticateToken, getAllUsers);
router.get('/user/:id', authenticateToken, getUserById);
router.delete('/user/:id', authenticateToken, deleteUser);

export default router;
