import express from 'express';
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} from '../controllers/reservationController';

const router = express.Router();

router.post('/reserve', createReservation);
router.put('/reserve/:reservationId', updateReservation);
router.get('/reserve', getAllReservations);
router.get('/reserve/:id', getReservationById);
router.delete('/reserve/:id', deleteReservation);

export default router;
