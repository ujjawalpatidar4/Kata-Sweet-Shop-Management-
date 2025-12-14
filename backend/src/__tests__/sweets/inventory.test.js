import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import User from '../../models/User.js';
import Sweet from '../../models/Sweet.js';

describe('Sweet Search and Inventory Tests', () => {
  let authToken;
  let adminToken;

  beforeAll(async () => {
    const MONGO_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGO_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});

    const userResponse = await request(app).post('/api/auth/register').send({
      name: 'Ujjawal Patidar',
      email: 'ujjawalp@gmail.com',
      password: 'password123',
    });
    authToken = userResponse.body.data.token;

    const admin = await User.create({
      name: 'Admin Ujjawal',
      email: 'admin@gmail.com',
      password: 'password123',
      role: 'admin',
    });
    const { generateToken } = await import('../../utils/jwt.js');
    adminToken = generateToken(admin._id);

    await Sweet.create([
      {
        name: 'Milk Chocolate Bar',
        category: 'Chocolate',
        price: 200,
        quantity: 100,
        description: 'Creamy milk chocolate',
      },
      {
        name: 'Dark Chocolate Truffle',
        category: 'Chocolate',
        price: 499,
        quantity: 50,
        description: 'Rich dark chocolate',
      },
      {
        name: 'Strawberry Gummies',
        category: 'Gummies',
        price: 199,
        quantity: 200,
        description: 'Sweet strawberry flavor',
      },
      {
        name: 'Sour Candy Mix',
        category: 'Sour',
        price: 349,
        quantity: 75,
        description: 'Tangy sour candies',
      },
      {
        name: 'Rainbow Lollipop',
        category: 'Lollipop',
        price: 0.99,
        quantity: 0, // Out of stock
        description: 'Colorful swirl lollipop',
      },
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/sweets/search', () => {
    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ name: 'chocolate' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.every(sweet => 
        sweet.name.toLowerCase().includes('chocolate')
      )).toBe(true);
    });

    it('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ category: 'Chocolate' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every(sweet => sweet.category === 'Chocolate')).toBe(true);
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ minPrice: 2, maxPrice: 4 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(sweet => 
        sweet.price >= 2 && sweet.price <= 4
      )).toBe(true);
    });

    it('should search sweets with multiple filters', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ 
          category: 'Chocolate',
          minPrice: 4,
          maxPrice: 6
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Dark Chocolate Truffle');
    });

    it('should return empty array when no sweets match', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ name: 'nonexistent' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should not search without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ name: 'chocolate' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Candy',
        price: 1.99,
        quantity: 10,
      });
      sweetId = sweet._id;
    });

    it('should purchase sweet and decrease quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(7);
      expect(response.body.message).toContain('purchased');
    });

    it('should not purchase more than available quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 15 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient');

      // Verify quantity unchanged
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(10);
    });

    it('should not purchase with invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not purchase without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send({ quantity: 1 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Test Sweet',
        category: 'Candy',
        price: 1.99,
        quantity: 10,
      });
      sweetId = sweet._id;
    });

    it('should restock sweet when authenticated as admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(60);
      expect(response.body.message).toContain('restocked');
    });

    it('should not restock when authenticated as regular user', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 50 })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized');

      // Verify quantity unchanged
      const sweet = await Sweet.findById(sweetId);
      expect(sweet.quantity).toBe(10);
    });

    it('should not restock with invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not restock without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .send({ quantity: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
