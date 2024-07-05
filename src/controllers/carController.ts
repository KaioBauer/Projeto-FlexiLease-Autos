import { Request, Response } from 'express';
import Car from '../models/car';
import mongoose from 'mongoose';

export const createCar = async (req: Request, res: Response) => {
  try {
    const {
      modelName,
      color,
      year,
      value_per_day,
      accessories,
      number_of_passengers,
    } = req.body;

    if (
      !modelName ||
      !color ||
      !year ||
      !value_per_day ||
      !accessories ||
      accessories.length == 0 ||
      !number_of_passengers
    ) {
      return res.status(400).json({
        error:
          'All fields are required and at least one accessory must be provided.',
      });
    }

    const car = new Car({
      modelName,
      color,
      year,
      value_per_day,
      accessories,
      number_of_passengers,
    });
    await car.save();
    res.status(201).json({ id: car._id, car });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export async function listCars(req: Request, res: Response) {
  try {
    const { page = 1, limit = 100, ...filters } = req.query;
    const paginationOptions = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    let criteria: { [key: string]: RegExp | string } = {};
    Object.keys(filters).forEach((key) => {
      criteria[key] = new RegExp(filters[key] as string, 'i');
    });

    const cars = await Car.find(criteria)
      .limit(paginationOptions.limit)
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .exec();
    const count = await Car.countDocuments(criteria);

    res.status(200).json({
      cars,
      total: count,
      limit: paginationOptions.limit,
      offset: (paginationOptions.page - 1) * paginationOptions.limit,
      offsets: Math.ceil(count / paginationOptions.limit),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteCar(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCar(req: Request, res: Response) {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  try {
    const updatedCar = await Car.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCar) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    res.status(200).json({ id: updatedCar._id, car: updatedCar });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function getCar(req: Request, res: Response) {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  try {
    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    res.status(200).json({ id: car._id, car });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function modifyCarAccessory(req: Request, res: Response) {
  const { carId, accessoryId } = req.params;
  const { description } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(carId) ||
    !mongoose.Types.ObjectId.isValid(accessoryId)
  ) {
    return res
      .status(400)
      .json({ error: 'Invalid ID format for car or accessory.' });
  }

  if (!description) {
    return res.status(400).json({ error: 'Description field is required.' });
  }

  try {
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    const accessory = car.accessories.find(
      (acc) => acc._id.toString() === accessoryId,
    );

    if (!accessory) {
      car.accessories.push({
        _id: new mongoose.Types.ObjectId(accessoryId),
        description,
      });
    } else {
      accessory.description = description;
    }

    const updatedCar = await car.save();
    res.status(200).json({ id: updatedCar._id, car: updatedCar });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
