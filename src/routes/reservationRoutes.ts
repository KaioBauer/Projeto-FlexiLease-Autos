import express from 'express';
import { createReservation } from '../controllers/reservationController';

const router = express.Router();

router.post('/reserve', createReservation);

export default router;
