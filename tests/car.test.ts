// tests/carRoutes.test.ts
import request from 'supertest';
import app from '../src/server'; // Ajuste conforme seu caminho
import { generateToken } from '../src/utils/generateToken'; // Suponha que essa função já exista

interface Accessory {
  _id: string;
  description: string;
}

describe('Car API Routes', () => {
  let token: string;
  let validCarId: string;
  let validAccessoryId: string;

  beforeAll(() => {
    token = generateToken('123');
  });

  it('should return a list of car when authenticated', async () => {
    const response = await request(app)
      .get('/api/v1/car')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
  });

  it('should deny access without token', async () => {
    const response = await request(app).get('/api/v1/car');
    expect(response.status).toBe(401);
  });

  it('should create a car when authenticated', async () => {
    const carData = {
      modelName: 'Test Model',
      color: 'Blue',
      year: 2020,
      value_per_day: 100,
      accessories: [{ description: 'Air Conditioning' }],
      number_of_passengers: 5,
    };

    const response = await request(app)
      .post('/api/v1/car')
      .send(carData)
      .set('Authorization', `Bearer ${token}`);
    validCarId = response.body.id;
    if (response.body.car && response.body.car.accessories.length > 0) {
      validAccessoryId = response.body.car.accessories[0]._id;
    }

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should update a car', async () => {
    const carData = {
      modelName: 'Test Model',
      color: 'Red',
      year: 2021,
      value_per_day: 50,
      accessories: [{ description: 'Air Conditioning' }],
      number_of_passengers: 4,
    };
    const response = await request(app)
      .put(`/api/v1/car/${validCarId}`)
      .send(carData)
      .set('Authorization', `Bearer ${token}`);

    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.car.color).toBe('Red'); // Verifique a estrutura da resposta da API
  });

  it('should handle accessory modifications', async () => {
    const description = 'Updated Accessory';
    const response = await request(app)
      .patch(`/api/v1/car/${validCarId}/accessories/${validAccessoryId}`)
      .send({ description: description })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(
      response.body.car.accessories.some(
        (acc: Accessory) => acc.description === description,
      ),
    ).toBe(true);
  });

  it('should delete a car', async () => {
    const response = await request(app)
      .delete(`/api/v1/car/${validCarId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });
});
