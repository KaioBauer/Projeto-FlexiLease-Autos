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
    const startDate = DateUtils.parseDateString(start_date)!;
    const endDate = DateUtils.parseDateString(end_date)!;

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

export const updateReservation = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { reservationId } = req.params;
  const { start_date, end_date } = req.body;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    const startDate = DateUtils.parseDateString(start_date);
    const endDate = DateUtils.parseDateString(end_date);
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Invalid date format provided.' });
    }

    // Fetch the car details
    const car = await Car.findById(reservation.car);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    const overlappingReservation = await Reservation.findOne({
      _id: { $ne: reservationId },
      car: reservation.car,
      $or: [
        { start_date: { $lte: endDate }, end_date: { $gte: startDate } },
        { end_date: { $gte: startDate }, start_date: { $lte: endDate } },
      ],
    });

    if (overlappingReservation) {
      return res
        .status(400)
        .json({ message: 'Car already booked for the given dates.' });
    }

    // Calculate final value
    const days =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
    const final_value = days * car.value_per_day;

    reservation.start_date = startDate;
    reservation.end_date = endDate;
    reservation.final_value = final_value;

    await reservation.save();
    return res.status(200).json({
      message: 'Reservation updated successfully',
      reservation,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

interface SearchFilters {
  [key: string]: any;
}

export const getAllReservations = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { page = 1, limit = 10, ...filters } = req.query;

  const queryFilters: SearchFilters = {};
  for (const key of Object.keys(filters)) {
    const value = filters[key];

    if (!value) {
      continue;
    }

    console.log(`Processing filter for key: ${key}, value: ${value}`);

    if (key === 'start_date' || key === 'end_date') {
      if (typeof value === 'string') {
        const [day, month, year] = value.split('/');
        const formattedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        queryFilters[key] = formattedDate;
        console.log(`Formatted date for key ${key}: ${formattedDate}`);
      }
    } else if (key === 'id_user' || key === 'id_car' || key === 'id_reserve') {
      if (typeof value === 'string') {
        queryFilters[key.replace('id_', '')] = new mongoose.Types.ObjectId(
          value,
        );
      }
    } else if (key === 'final_value') {
      if (typeof value === 'string') {
        queryFilters[key] = parseFloat(value);
      }
    } else {
      if (typeof value === 'string') {
        queryFilters[key] = { $regex: new RegExp(value, 'i') };
      }
    }
  }

  try {
    console.log('Query Filters:', queryFilters);

    const reservations = await Reservation.find(queryFilters)
      .populate('user', 'name')
      .populate('car', 'model')
      .skip((parseInt(page as string, 10) - 1) * parseInt(limit as string, 10))
      .limit(parseInt(limit as string, 10));

    console.log('Found Reservations:', reservations);

    const totalReservations = await Reservation.countDocuments(queryFilters);

    return res.status(200).json({
      reserves: reservations.map((reservation) => ({
        id_reserve: reservation._id.toString(),
        id_user: reservation.user._id.toString(),
        start_date: reservation.start_date.toLocaleDateString('pt-BR'),
        end_date: reservation.end_date.toLocaleDateString('pt-BR'),
        id_car: reservation.car._id.toString(),
        final_value: reservation.final_value.toFixed(2),
      })),
      total: totalReservations,
      limit: parseInt(limit as string, 10),
      page: parseInt(page as string, 10),
      totalPages: Math.ceil(totalReservations / parseInt(limit as string, 10)),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getReservationById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  console.log(`Received reservation ID: ${id}`); // Log do ID recebido

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('Invalid reservation ID format'); // Log do formato inválido
    return res.status(400).json({ error: 'Invalid reservation ID.' });
  }

  try {
    const reservation = await Reservation.findById(id)
      .populate('user', 'name')
      .populate('car', 'model');

    if (!reservation) {
      console.log('Reservation not found'); // Log de reserva não encontrada
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    console.log('Reservation found', reservation); // Log da reserva encontrada
    return res.status(200).json({
      id_reserve: reservation._id.toString(),
      id_user: reservation.user._id.toString(),
      start_date: reservation.start_date.toLocaleDateString('pt-BR'),
      end_date: reservation.end_date.toLocaleDateString('pt-BR'),
      id_car: reservation.car._id.toString(),
      final_value: reservation.final_value.toFixed(2),
    });
  } catch (error: any) {
    console.log('Error fetching reservation:', error.message); // Log de erro
    return res.status(500).json({ error: error.message });
  }
};

export const deleteReservation = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;

  console.log(`Received reservation ID: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('Invalid reservation ID format');
    return res.status(400).json({ error: 'Invalid reservation ID format.' });
  }

  try {
    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      console.log('Reservation not found');
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    console.log('Reservation deleted successfully');
    return res.status(204).send();
  } catch (error: any) {
    console.log('Error deleting reservation:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
