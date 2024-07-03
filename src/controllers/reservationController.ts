import { Request, Response } from 'express';
import User from '../models/user';
import Car from '../models/car';
import Reservation from '../models/reservation';
import { DateUtils } from '../utils/dateUtils';
import mongoose from 'mongoose';

interface IReservationRequest {
  id_user: string;
  id_car: string;
  start_date: string;
  end_date: string;
}

export const createReservation = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id_user, id_car, start_date, end_date } =
    req.body as IReservationRequest;

  try {
    const startDate = DateUtils.parseDateString(start_date);
    const endDate = DateUtils.parseDateString(end_date);

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Invalid date format provided.' });
    }

    const user = await User.findById(id_user);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.qualified !== 'sim') {
      return res.status(400).json({ error: 'User is not qualified to drive.' });
    }

    const car = await Car.findById(id_car);
    if (!car) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    const overlappingReservationForUser = await Reservation.findOne({
      user: id_user,
      $or: [
        { start_date: { $lte: endDate }, end_date: { $gte: startDate } },
        { end_date: { $gte: startDate }, start_date: { $lte: endDate } },
      ],
    });

    if (overlappingReservationForUser) {
      return res.status(400).json({
        error: 'User has another reservation that conflicts with these dates.',
      });
    }

    const finalValue =
      DateUtils.calculateDays(startDate, endDate) * car.value_per_day;

    const newReservation = new Reservation({
      user: user._id,
      car: car._id,
      start_date: startDate,
      end_date: endDate,
      final_value: finalValue,
    });

    await newReservation.save();

    return res.status(201).json({
      id_reserve: newReservation._id.toString(),
      id_user: user._id.toString(),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      id_car: (car._id as mongoose.Types.ObjectId).toString(),
      final_value: finalValue.toFixed(2),
    });
  } catch (error: any) {
    console.error('Reservation creation error:', error);
    return res.status(500).json({ error: error.message });
  }
};
