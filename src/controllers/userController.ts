// src/controllers/userController.ts
import axios from 'axios';
import { Request, Response } from 'express';
import User from '../models/user';
import userSchema from '../validations/userValidation';

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Validação inicial dos campos fornecidos pelo usuário
    const validatedData = await userSchema.validate(req.body, {
      abortEarly: false,
    });

    // Chamada à API ViaCEP para obtenção de dados adicionais de endereço
    const cepResponse = await axios.get(
      `https://viacep.com.br/ws/${req.body.cep}/json/`,
    );
    const { data } = cepResponse;

    // Verifica se a API retornou algum erro, como um CEP inexistente
    if (data.erro) {
      res.status(400).json({ message: `CEP ${req.body.cep} not found` });
      return;
    }

    // Definir os campos com verificação de string vazia ou 'N/A' para valores não fornecidos
    const neighborhood = data.bairro || 'N/A';
    const locality = data.localidade || 'N/A';
    const uf = data.uf || 'N/A';

    // Criação do usuário com todos os dados recebidos e validados
    const newUser = new User({
      ...validatedData,
      neighborhood,
      locality,
      uf,
    });

    // Salvando o novo usuário no banco de dados
    await newUser.save();

    // Resposta bem-sucedida com os dados do usuário
    res.status(201).json({
      message: 'User successfully registered!',
      user: newUser.toObject({ getters: true, versionKey: false }), // Remover __v e usar getters se aplicável
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      // Resposta para erro de validação do schema yup
      res.status(400).json({ errors: error.errors });
    } else {
      // Resposta para outros tipos de erros internos
      res
        .status(500)
        .json({ message: 'Error registering user', error: error.message });
    }
  }
};
