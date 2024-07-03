// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  birth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cep: { type: String, required: true },
  qualified: { type: String, required: true },
  patio: { type: String },
  complement: { type: String },
  neighborhood: { type: String, required: true },
  locality: { type: String, required: true },
  uf: { type: String, required: true },
});

userSchema.pre('save', async function (this: any, next: () => void) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
