import * as yup from 'yup';

export const reservationValidation = yup.object({
  user: yup.string().required(),
  car: yup.string().required(),
  start_date: yup.date().required(),
  end_date: yup.date().required().min(yup.ref('start_date')),
  final_value: yup.number().required(),
});
