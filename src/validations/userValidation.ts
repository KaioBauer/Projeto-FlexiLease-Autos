// src/validations/userValidation.js
const yup = require('yup');

const userSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  cpf: yup
    .string()
    .required('CPF is required')
    .matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, 'CPF inválido'),
  birth: yup
    .date()
    .required('Birthdate is required')
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      'User must be at least 18 years old',
    ),
  email: yup.string().email('Email is invalid').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required'),
  cep: yup.string().required('CEP is required'),
  qualified: yup
    .string()
    .oneOf(['sim', 'não'])
    .required('Qualified status is required'),
  patio: yup.string(),
  complement: yup.string(),
  // Not required initially as they are fetched from the API
  neighborhood: yup.string(),
  locality: yup.string(),
  uf: yup.string(),
});

export default userSchema;
