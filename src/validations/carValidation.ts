// validations/carValidation.ts
import * as yup from 'yup';

export const carSchema = yup.object({
  body: yup.object({
    modelName: yup.string().required('Model name is required'),
    color: yup.string().required(),
    year: yup.number().min(1950).max(2023).required(),
    value_per_day: yup.number().required(),
    accessories: yup
      .array()
      .of(
        yup.object({
          description: yup.string().required(),
        }),
      )
      .min(1),
    number_of_passengers: yup.number().required(),
  }),
});
