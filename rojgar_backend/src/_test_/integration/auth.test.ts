import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
};

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI?.replace('/rojgar', '/rojgar_test')
    ?? 'mongodb://127.0.0.1:27017/rojgar_test';
  await mongoose.connect(mongoUri);
  await UserModel.deleteMany({ email: testUser.email });
}, 30000);

afterAll(async () => {
  await UserModel.deleteMany({ email: testUser.email });
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 30000);

describe('POST /api/auth/register', () => {
  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('email', testUser.email);
    expect(response.body.data).not.toHaveProperty('password');
  });

  test('should fail to register with already registered email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Email already registered');
  });

  test('should fail to register if email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'Password123!' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Email and password are required');
  });

  test('should fail to register if password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'nopassword@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Email and password are required');
  });
});

describe('POST /api/auth/login', () => {
  test('should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('email', testUser.email);
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  test('should fail to login with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword123!' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  test('should fail to login with unregistered email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notregistered@example.com', password: 'Password123!' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });

  test('should fail to login if email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password123!' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Email/Username and password are required');
  });

  test('should fail to login if password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Email/Username and password are required');
  });
});

describe('POST /api/auth/request-password-reset', () => {
  test('should send reset link for registered email', async () => {
    const response = await request(app)
      .post('/api/auth/request-password-reset')
      .send({ email: testUser.email });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'If this email exists, a reset link has been sent.');
  });

  test('should return success even for unregistered email', async () => {
    const response = await request(app)
      .post('/api/auth/request-password-reset')
      .send({ email: 'notexist@example.com' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'If this email exists, a reset link has been sent.');
  });

  test('should fail if email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/request-password-reset')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Email is required');
  });
});

describe('POST /api/auth/reset-password/:token', () => {
  test('should fail with invalid or expired token', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password/invalidtoken123')
      .send({ password: 'NewPassword123!' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid or expired reset token');
  });

  test('should fail if new password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password/sometoken')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'New password is required');
  });
});