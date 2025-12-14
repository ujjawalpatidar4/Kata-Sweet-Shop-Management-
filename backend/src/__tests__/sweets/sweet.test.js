import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import User from '../../models/User.js';
import Sweet from '../../models/Sweet.js';

describe('Sweet API Tests', () => {
  let authToken;
  let adminToken;
  let userId;
  let adminId;

  beforeAll(async () => {
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweet-shop-test';
    await mongoose.connect(MONGO_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});

    // Create regular user
    const userResponse = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
    });
    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user.id;

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminId = admin._id;
    const { generateToken } = await import('../../utils/jwt.js');
    adminToken = generateToken(admin._id);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet when authenticated', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
        description: 'Delicious milk chocolate bar',
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(sweetData.name);
      expect(response.body.data.category).toBe(sweetData.category);
      expect(response.body.data.price).toBe(sweetData.price);
      expect(response.body.data.quantity).toBe(sweetData.quantity);
    });

    it('should not create sweet without authentication', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not create sweet with missing required fields', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        // missing category, price, quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create sweet with negative price', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: -2.99,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      await Sweet.create([
        {
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.99,
          quantity: 100,
          description: 'Delicious milk chocolate',
        },
        {
          name: 'Gummy Bears',
          category: 'Gummies',
          price: 1.99,
          quantity: 50,
          description: 'Colorful gummy bears',
        },
        {
          name: 'Lollipop',
          category: 'Candy',
          price: 0.99,
          quantity: 200,
          description: 'Sweet lollipop',
        },
      ]);
    });

    it('should get all sweets when authenticated', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    it('should not get sweets without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/sweets/:id', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
      });
      sweetId = sweet._id;
    });

    it('should get a single sweet by ID when authenticated', async () => {
      const response = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Chocolate Bar');
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
      });
      sweetId = sweet._id;
    });

    it('should update a sweet when authenticated', async () => {
      const updateData = {
        name: 'Dark Chocolate Bar',
        price: 3.99,
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.category).toBe('Chocolate'); // unchanged
    });

    it('should return 404 for updating non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
      });
      sweetId = sweet._id;
    });

    it('should delete a sweet when authenticated as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify sweet is deleted
      const deletedSweet = await Sweet.findById(sweetId);
      expect(deletedSweet).toBeNull();
    });

    it('should not delete sweet when authenticated as regular user', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');

      // Verify sweet still exists
      const sweet = await Sweet.findById(sweetId);
      expect(sweet).not.toBeNull();
    });

    it('should not delete sweet without authentication', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
