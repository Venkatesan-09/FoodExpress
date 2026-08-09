require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Restaurant = require('../src/models/Restaurant');

async function testQuery() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect('mongodb://127.0.0.1:27017/foodexpress');
    console.log('Connected! Querying restaurants...');
    const result = await Restaurant.findOne({});
    console.log('Query success! Result:', result);
  } catch (err) {
    console.error('Query failed with error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testQuery();
