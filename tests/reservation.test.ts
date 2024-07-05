import request from 'supertest';
import app from '../src/server';
import { generateToken } from '../src/utils/generateToken';
import mongoose from 'mongoose';
import User from '../src/models/user';
import Car from '../src/models/car';
import Reservation from '../src/models/reservation';

let server: any;
let token: string;
let userId: string;
let carId: string;
let reservationId: string;

beforeAll(async () => {
  server = app.listen(0, () => {
    console.log(`Test server running on port ${server.address().port}`);
  });

  token = generateToken('123');

  const user = new User({
    name: 'Test User',
    cpf: '123.456.789-00',
    birth: '2000-01-01',
    email: 'testuser@example.com',
    password: 'password',
    cep: '01001000',
    qualified: 'sim',
    neighborhood: 'Centro',
    locality: 'São Paulo',
    uf: 'SP',
  });
  await user.save();
  userId = user._id.toString();

  const car = new Car({
    modelName: 'Test Car',
    color: 'Blue',
    year: 2020,
    value_per_day: 100,
    accessories: [{ description: 'Air Conditioning' }],
    number_of_passengers: 5,
  });
  await car.save();
  carId = (car._id as unknown as mongoose.Types.ObjectId).toString();
});

afterAll(async () => {
  await User.findByIdAndDelete(userId);
  await Car.findByIdAndDelete(carId);
  server.close();
});

describe('Reservation API Routes', () => {
  it('should create a new reservation', async () => {
    const reservationData = {
      id_user: userId,
      id_car: carId,
      start_date: '01/01/2023',
      end_date: '10/01/2023',
    };

    const response = await request(app)
      .post('/api/v1/reserve')
      .send(reservationData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_reserve');
    reservationId = response.body.id_reserve;
  });

  it('should get a reservation by ID', async () => {
    const response = await request(app)
      .get(`/api/v1/reserve/${reservationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id_reserve', reservationId);
  });

  it('should update a reservation', async () => {
    const updateData = {
      start_date: '02/01/2023',
      end_date: '12/01/2023',
    };

    const response = await request(app)
      .put(`/api/v1/reserve/${reservationId}`)
      .send(updateData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.reservation).toHaveProperty('start_date');
    expect(response.body.reservation).toHaveProperty('end_date');
  });

  it('should get all reservations with pagination and filters', async () => {
    const response = await request(app)
      .get('/api/v1/reserve')
      .query({ page: 1, limit: 10, id_user: userId })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.reserves)).toBeTruthy();
  });

  it('should delete a reservation', async () => {
    const response = await request(app)
      .delete(`/api/v1/reserve/${reservationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should deny access without token', async () => {
    const response = await request(app).get('/api/v1/reserve');
    expect(response.status).toBe(401);
  });
});
