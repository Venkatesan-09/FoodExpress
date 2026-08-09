require('dotenv').config({ path: '../.env' });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

async function testRequest() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect('mongodb://127.0.0.1:27017/foodexpress');

    // Find a restaurant owner user
    const user = await User.findOne({ role: 'restaurant_owner' });
    if (!user) {
      console.log('No restaurant owner found in database. Trying any user...');
      const anyUser = await User.findOne({});
      if (!anyUser) {
        console.log('No users in database.');
        return;
      }
      runWithUser(anyUser);
    } else {
      await runWithUser(user);
    }
  } catch (err) {
    console.error('Test request failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

async function runWithUser(user) {
  console.log(`Using user: ${user.email} (${user.role})`);

  // Generate token using the loaded environment secret
  const token = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m'
  });

  console.log('Making request to /api/v1/restaurants/my-restaurant...');
  const res = await request(app)
    .get('/api/v1/restaurants/my-restaurant')
    .set('Authorization', `Bearer ${token}`);

  console.log('Status code:', res.status);
  console.log('Response body:', res.body);
}

testRequest();
