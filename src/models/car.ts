import mongoose, { Schema, Document, Model } from 'mongoose';

interface IAccessory {
  _id: mongoose.Types.ObjectId;
  description: string;
}

interface ICar extends Document {
  modelName: string;
  color: string;
  year: number;
  value_per_day: number;
  accessories: IAccessory[];
  number_of_passengers: number;
}

const accessorySchema = new Schema<IAccessory>(
  {
    description: { type: String, required: true },
  },
  { _id: true },
);

const carSchema = new Schema<ICar>(
  {
    modelName: { type: String, required: true },
    color: { type: String, required: true },
    year: { type: Number, required: true, min: 1950, max: 2023 },
    value_per_day: { type: Number, required: true },
    accessories: { type: [accessorySchema], required: true },
    number_of_passengers: { type: Number, required: true },
  },
  {
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  },
);

export const Car: Model<ICar> = mongoose.model<ICar>('Car', carSchema);
export default Car;
