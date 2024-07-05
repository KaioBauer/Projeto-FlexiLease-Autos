import express from 'express';
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} from '../controllers/reservationController';
import { authenticateToken } from '../middlewares/authenticateToken';

const router = express.Router();

router.post('/reserve', authenticateToken, createReservation);
router.put('/reserve/:reservationId', authenticateToken, updateReservation);
router.get('/reserve', authenticateToken, getAllReservations);
router.get('/reserve/:id', authenticateToken, getReservationById);
router.delete('/reserve/:id', authenticateToken, deleteReservation);

export default router;
