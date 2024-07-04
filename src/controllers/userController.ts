import axios from 'axios';
import { Request, Response } from 'express';
import User from '../models/user';
import { userSchema } from '../validations/userValidation';
import { updateUserSchema } from '../validations/userValidation';
import bcrypt from 'bcrypt';

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validatedData = await userSchema.validate(req.body, {
      abortEarly: false,
    });

    const cepResponse = await axios.get(
      `https://viacep.com.br/ws/${req.body.cep}/json/`,
    );
    const { data } = cepResponse;

    if (data.erro) {
      res.status(400).json({ message: `CEP ${req.body.cep} not found` });
      return;
    }

    const neighborhood = data.bairro || 'N/A';
    const locality = data.localidade || 'N/A';
    const uf = data.uf || 'N/A';

    const newUser = new User({
      ...validatedData,
      neighborhood,
      locality,
      uf,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User successfully registered!',
      user: newUser.toObject({ getters: true, versionKey: false }),
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ errors: error.errors });
    } else {
      res
        .status(500)
        .json({ message: 'Error registering user', error: error.message });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10); // Uso do fator de sal recomendado
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    await updateUserSchema.validate(updateData, { abortEarly: false });

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ errors: error.errors });
    } else {
      res
        .status(500)
        .json({ message: 'Error updating user', error: error.message });
    }
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error retrieving users', error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error retrieving user', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).json();
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error deleting user', error: error.message });
  }
};
