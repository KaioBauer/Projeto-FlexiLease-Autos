import { Router } from 'express';
import {
  createCar,
  listCars,
  getCar,
  updateCar,
  deleteCar,
  modifyCarAccessory,
} from '../controllers/carController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/car', authenticate, createCar);
router.get('/car', authenticate, listCars);
router.delete('/car/:id', authenticate, deleteCar);
router.put('/car/:id', authenticate, updateCar);
router.get('/car/:id', authenticate, getCar);
router.patch(
  '/car/:carId/accessories/:accessoryId',
  authenticate,
  modifyCarAccessory,
);

export default router;
