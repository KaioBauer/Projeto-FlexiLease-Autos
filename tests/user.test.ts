import request from 'supertest';
import app from '../src/server';
import { generateToken } from '../src/utils/generateToken';

let server: any;
beforeAll((done) => {
  server = app.listen(0, () => {
    console.log(`Test server running on port ${server.address().port}`);
    done();
  });
});

afterAll(() => {
  server.close();
});

describe('User API Routes', () => {
  let token: string;
  let UserId: string;

  beforeAll(() => {
    token = generateToken('123');
  });

  it('should create a new user', async () => {
    const newUser = {
      name: 'Jane Doe',
      cpf: '123.456.789-10',
      birth: '01/01/2000',
      email: 'jane@example.com',
      password: 'password123',
      cep: '01001000',
      qualified: 'sim',
    };

    const response = await request(app)
      .post('/api/v1/user')
      .send(newUser)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(newUser.email);
    UserId = response.body.user._id;
  });

  it('should get all users', async () => {
    const response = await request(app)
      .get('/api/v1/user')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  it('should update a user', async () => {
    const updates = {
      name: 'Jane Updated',
      cpf: '123.456.789-10',
      birth: '01/01/2000',
      email: 'jane@example.com',
      password: 'password123',
      cep: '01001000',
      qualified: 'sim',
    };

    const response = await request(app)
      .put(`/api/v1/user/${UserId}`)
      .send(updates)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updates.name);
  });

  it('should delete a user', async () => {
    const response = await request(app)
      .delete(`/api/v1/user/${UserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should deny access without token', async () => {
    const response = await request(app).get('/api/v1/user');
    expect(response.status).toBe(401);
  });
});
