/**
 * FoodExpress — Demo Data Seed Script
 * Run: npm run seed
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');

const BASE_LAT = parseFloat(process.env.DEMO_MAP_CENTER_LAT) || 12.9716;
const BASE_LNG = parseFloat(process.env.DEMO_MAP_CENTER_LNG) || 77.5946;

const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

async function seed() {
  console.log('🌱 Starting full seed with rich restaurant & dish photos...');
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodexpress';
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Cloud Cluster');
  } catch (dbErr) {
    console.warn('⚠️ Cloud MongoDB connection notice:', dbErr.message);
    console.log('🔄 Seeding fallback database...');
    await mongoose.connect('mongodb://127.0.0.1:27017/foodexpress');
    console.log('✅ Connected to database');
  }

  // Clear existing restaurants and menu items to refresh with rich photography
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});

  // ── Admin ──────────────────────────────────────────────────────────────────
  let admin = await User.findOne({ email: 'admin@foodexpress.demo' });
  if (!admin) {
    admin = await User.create({
      name: 'Platform Admin',
      email: 'admin@foodexpress.demo',
      password: 'Admin@123456',
      role: 'admin',
      phone: '9000000000',
      isVerified: true,
      isActive: true,
    });
    console.log('✅ Admin created — admin@foodexpress.demo / Admin@123456');
  }

  // ── Customers ──────────────────────────────────────────────────────────────
  const customerData = [
    { name: 'Rahul Sharma', email: 'rahul@demo.com', phone: '9111111111' },
    { name: 'Priya Patel', email: 'priya@demo.com', phone: '9222222222' },
    { name: 'Arjun Singh', email: 'arjun@demo.com', phone: '9333333333' },
  ];

  const customers = [];
  for (const c of customerData) {
    let user = await User.findOne({ email: c.email });
    if (!user) {
      user = await User.create({ ...c, password: 'Customer@123', role: 'customer', isVerified: true });
    }
    customers.push(user);
  }

  // ── Restaurant Owners ──────────────────────────────────────────────────────
  const ownerData = [
    { name: 'Meera Iyer', email: 'meera@demo.com', phone: '9444444444' },
    { name: 'Vikram Nair', email: 'vikram@demo.com', phone: '9555555555' },
    { name: 'Sunita Reddy', email: 'sunita@demo.com', phone: '9666666666' },
    { name: 'Anil Kapoor', email: 'anil@demo.com', phone: '9777777888' },
    { name: 'Sanjay Dutt', email: 'sanjay@demo.com', phone: '9888888999' },
  ];

  const owners = [];
  for (const o of ownerData) {
    let user = await User.findOne({ email: o.email });
    if (!user) {
      user = await User.create({ ...o, password: 'Owner@123456', role: 'restaurant_owner', isVerified: true });
    }
    owners.push(user);
  }

  // ── Delivery Partners ──────────────────────────────────────────────────────
  let partner = await User.findOne({ email: 'ravi@demo.com' });
  if (!partner) {
    partner = await User.create({
      name: 'Ravi Kumar',
      email: 'ravi@demo.com',
      password: 'Partner@123',
      role: 'delivery_partner',
      phone: '9777777777',
      vehicleType: 'motorcycle',
      verificationStatus: 'approved',
      isOnline: true,
      isVerified: true,
    });
  }

  // ── Restaurants ────────────────────────────────────────────────────────────
  const restaurantSeeds = [
    {
      ownerIdx: 0,
      name: 'Spice Garden',
      description: 'Authentic South Indian cuisine with crispy dosas, fluffy idlis and aromatic biryanis.',
      cuisine: ['South Indian', 'Biryani', 'Vegetarian'],
      priceRange: 2,
      deliveryTime: 25,
      deliveryFee: 30,
      minOrderValue: 150,
      isVegOnly: false,
      tags: ['top rated', 'trending'],
      lat: BASE_LAT + 0.02,
      lng: BASE_LNG + 0.03,
      address: { line1: '12, MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80'],
    },
    {
      ownerIdx: 1,
      name: 'The Burger Lab',
      description: 'Gourmet smashed burgers, crispy chicken fillets, and loaded cheese fries.',
      cuisine: ['Burgers', 'Fast Food', 'American'],
      priceRange: 2,
      deliveryTime: 20,
      deliveryFee: 40,
      minOrderValue: 200,
      isVegOnly: false,
      tags: ['trending', 'new'],
      lat: BASE_LAT - 0.01,
      lng: BASE_LNG + 0.04,
      address: { line1: '45, Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
      images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'],
    },
    {
      ownerIdx: 2,
      name: 'Green Leaf Veg',
      description: 'Pure vegetarian thalis, rich paneer gravies, and hot garlic naans.',
      cuisine: ['North Indian', 'South Indian', 'Vegetarian'],
      priceRange: 1,
      deliveryTime: 30,
      deliveryFee: 20,
      minOrderValue: 100,
      isVegOnly: true,
      tags: ['top rated'],
      lat: BASE_LAT + 0.05,
      lng: BASE_LNG - 0.02,
      address: { line1: '8, Jayanagar 4th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560011' },
      images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80'],
    },
    {
      ownerIdx: 3,
      name: 'Royal Biryani House',
      description: 'Slow-cooked Dum Biryani infused with saffron, rich spices, and succulent meats.',
      cuisine: ['Biryani', 'North Indian', 'Fast Food'],
      priceRange: 3,
      deliveryTime: 35,
      deliveryFee: 35,
      minOrderValue: 250,
      isVegOnly: false,
      tags: ['top rated', 'trending'],
      lat: BASE_LAT + 0.03,
      lng: BASE_LNG + 0.01,
      address: { line1: '77, Koramangala 5th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560095' },
      images: ['https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80'],
    },
    {
      ownerIdx: 4,
      name: 'Bella Italia Pizzeria',
      description: 'Hand-tossed woodfired sourdough pizzas with authentic Italian herbs and mozzarella.',
      cuisine: ['Fast Food', 'Burgers', 'Vegetarian'],
      priceRange: 2,
      deliveryTime: 25,
      deliveryFee: 45,
      minOrderValue: 220,
      isVegOnly: false,
      tags: ['trending'],
      lat: BASE_LAT - 0.03,
      lng: BASE_LNG - 0.01,
      address: { line1: '102, HSR Layout Sector 1', city: 'Bengaluru', state: 'Karnataka', pincode: '560102' },
      images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80'],
    },
    {
      ownerIdx: 0,
      name: 'Dragon Express Wok',
      description: 'Pan-Asian wok specialties, spicy ramen bowls, steamed momos, and Manchurian.',
      cuisine: ['Fast Food', 'North Indian'],
      priceRange: 2,
      deliveryTime: 30,
      deliveryFee: 30,
      minOrderValue: 180,
      isVegOnly: false,
      tags: ['new'],
      lat: BASE_LAT + 0.01,
      lng: BASE_LNG - 0.04,
      address: { line1: '24, Church Street', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      images: ['https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80'],
    },
    {
      ownerIdx: 1,
      name: 'Sweet Dreams Bakery & Cafe',
      description: 'Freshly baked artisanal cakes, Belgian waffles, croissants and cold brew coffee.',
      cuisine: ['Fast Food', 'Vegetarian'],
      priceRange: 2,
      deliveryTime: 20,
      deliveryFee: 25,
      minOrderValue: 120,
      isVegOnly: true,
      tags: ['top rated'],
      lat: BASE_LAT - 0.02,
      lng: BASE_LNG - 0.03,
      address: { line1: '15, Lavelle Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      images: ['https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80'],
    },
    {
      ownerIdx: 2,
      name: 'Tandoori Nights',
      description: 'Juicy tandoori chicken, butter naan, seekh kebabs, and creamy butter chicken.',
      cuisine: ['North Indian', 'Biryani'],
      priceRange: 3,
      deliveryTime: 30,
      deliveryFee: 35,
      minOrderValue: 200,
      isVegOnly: false,
      tags: ['trending'],
      lat: BASE_LAT + 0.04,
      lng: BASE_LNG + 0.02,
      address: { line1: '88, Whitefield Main Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560066' },
      images: ['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&q=80'],
    },
  ];

  const restaurants = [];
  for (const rs of restaurantSeeds) {
    const restaurant = await Restaurant.create({
      owner: owners[rs.ownerIdx]._id,
      name: rs.name,
      description: rs.description,
      cuisine: rs.cuisine,
      address: rs.address,
      location: { lat: rs.lat, lng: rs.lng },
      priceRange: rs.priceRange,
      deliveryTime: rs.deliveryTime,
      deliveryFee: rs.deliveryFee,
      minOrderValue: rs.minOrderValue,
      isVegOnly: rs.isVegOnly,
      isOpen: true,
      status: 'approved',
      tags: rs.tags,
      rating: { avg: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)), count: randInt(80, 600) },
      openingHours: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => ({
        day, isOpen: true, openTime: '09:00', closeTime: '23:00'
      })),
      images: rs.images,
    });
    console.log(`✅ Restaurant: ${rs.name}`);
    restaurants.push(restaurant);
  }

  // ── Menu Items ─────────────────────────────────────────────────────────────
  const menuSeeds = [
    // 0: Spice Garden
    { restaurantIdx: 0, category: 'Dosas', name: 'Masala Dosa', price: 90, isVeg: true, isBestseller: true, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80' },
    { restaurantIdx: 0, category: 'Dosas', name: 'Mysore Masala Dosa', price: 110, isVeg: true, isBestseller: false, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80' },
    { restaurantIdx: 0, category: 'Biryani', name: 'Chicken Dum Biryani', price: 280, isVeg: false, isBestseller: true, discount: 10, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },
    { restaurantIdx: 0, category: 'Starters', name: 'Chicken 65', price: 220, isVeg: false, isBestseller: true, image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&q=80' },

    // 1: Burger Lab
    { restaurantIdx: 1, category: 'Burgers', name: 'Classic Bacon & Cheese Burger', price: 299, isVeg: false, isBestseller: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
    { restaurantIdx: 1, category: 'Burgers', name: 'Crispy Zinger Chicken Burger', price: 269, isVeg: false, isBestseller: false, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80' },
    { restaurantIdx: 1, category: 'Sides', name: 'Cheesy Loaded Fries', price: 149, isVeg: true, isBestseller: true, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80' },

    // 2: Green Leaf Veg
    { restaurantIdx: 2, category: 'Starters', name: 'Tandoori Paneer Tikka', price: 199, isVeg: true, isBestseller: true, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80' },
    { restaurantIdx: 2, category: 'Mains', name: 'Dal Makhani & Naan Combo', price: 240, isVeg: true, isBestseller: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80' },
    { restaurantIdx: 2, category: 'Mains', name: 'Chole Bhature', price: 150, isVeg: true, isBestseller: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80' },

    // 3: Royal Biryani House
    { restaurantIdx: 3, category: 'Biryani', name: 'Special Mutton Dum Biryani', price: 380, isVeg: false, isBestseller: true, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80' },
    { restaurantIdx: 3, category: 'Biryani', name: 'Hyderabadi Veg Biryani', price: 240, isVeg: true, isBestseller: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },

    // 4: Bella Italia Pizzeria
    { restaurantIdx: 4, category: 'Pizzas', name: 'Pepperoni Supreme Pizza', price: 449, isVeg: false, isBestseller: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80' },
    { restaurantIdx: 4, category: 'Pizzas', name: 'Margherita Basil Pizza', price: 349, isVeg: true, isBestseller: true, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80' },

    // 5: Dragon Express Wok
    { restaurantIdx: 5, category: 'Noodles & Rice', name: 'Hakka Noodles with Chilli Paneer', price: 230, isVeg: true, isBestseller: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80' },
    { restaurantIdx: 5, category: 'Momos', name: 'Steamed Chicken Momos (8 pcs)', price: 180, isVeg: false, isBestseller: true, image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&q=80' },

    // 6: Sweet Dreams Bakery
    { restaurantIdx: 6, category: 'Desserts', name: 'Belgian Chocolate Waffles', price: 210, isVeg: true, isBestseller: true, image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=500&q=80' },
    { restaurantIdx: 6, category: 'Cakes', name: 'Red Velvet Pastry', price: 130, isVeg: true, isBestseller: false, image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&q=80' },

    // 7: Tandoori Nights
    { restaurantIdx: 7, category: 'Tandoor', name: 'Tandoori Full Chicken', price: 420, isVeg: false, isBestseller: true, image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80' },
    { restaurantIdx: 7, category: 'Mains', name: 'Butter Chicken with Garlic Naan', price: 320, isVeg: false, isBestseller: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80' },
  ];

  for (const mi of menuSeeds) {
    await MenuItem.create({
      restaurant: restaurants[mi.restaurantIdx]._id,
      name: mi.name,
      category: mi.category,
      price: mi.price,
      isVeg: mi.isVeg,
      isBestseller: mi.isBestseller || false,
      discount: mi.discount || 0,
      inStock: true,
      description: `Delicious ${mi.name} prepared fresh with authentic ingredients.`,
      image: mi.image,
      addOns: mi.isVeg ? [{ name: 'Extra Dip', price: 30 }] : [{ name: 'Extra Sauce', price: 30 }],
    });
  }
  console.log(`✅ Created ${menuSeeds.length} menu items with real food photos`);

  // ── Coupons ────────────────────────────────────────────────────────────────
  const couponSeeds = [
    { code: 'WELCOME50', discountType: 'flat', value: 50, minOrderValue: 200, description: '₹50 off on first order' },
    { code: 'FEAST20', discountType: 'percentage', value: 20, maxDiscount: 100, minOrderValue: 300, description: '20% off up to ₹100' },
    { code: 'FREEDEL', discountType: 'flat', value: 40, minOrderValue: 150, description: 'Free delivery (₹40 off)' },
  ];

  for (const cs of couponSeeds) {
    let existing = await Coupon.findOne({ code: cs.code });
    if (!existing) {
      await Coupon.create({
        ...cs,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        scope: 'global',
        createdBy: admin._id,
      });
    }
  }

  console.log('\n🎉 Seed complete!\n');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
