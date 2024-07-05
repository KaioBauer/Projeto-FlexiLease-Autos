import { Router } from 'express';
import {
  createCar,
  listCars,
  getCar,
  updateCar,
  deleteCar,
  modifyCarAccessory,
} from '../controllers/carController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = Router();

router.post('/car', authenticateToken, createCar);
router.get('/car', authenticateToken, listCars);
router.delete('/car/:id', authenticateToken, deleteCar);
router.put('/car/:id', authenticateToken, updateCar);
router.get('/car/:id', authenticateToken, getCar);
router.patch(
  '/car/:carId/accessories/:accessoryId',
  authenticateToken,
  modifyCarAccessory,
);

export default router;
