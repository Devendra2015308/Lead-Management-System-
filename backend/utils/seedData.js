const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Lead = require('../models/Lead');

const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
const companies = ['TechCorp', 'InnovateLab', 'DataSystems', 'CloudSoft', 'NextGen Tech', 'AI Solutions', 'WebDev Co', 'Mobile First', 'Digital Hub', 'StartupXYZ'];
const cities = ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Austin', 'Seattle', 'Boston', 'Denver', 'Miami', 'Atlanta'];
const states = ['NY', 'CA', 'IL', 'TX', 'WA', 'MA', 'CO', 'FL', 'GA'];

const generateRandomLead = (userId) => {
  const firstName = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'Ryan', 'Anna'][Math.floor(Math.random() * 10)];
  const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][Math.floor(Math.random() * 10)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
  
  return {
    userId,
    firstName,
    lastName,
    email,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    company: companies[Math.floor(Math.random() * companies.length)],
    city: cities[Math.floor(Math.random() * cities.length)],
    state: states[Math.floor(Math.random() * states.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    score: Math.floor(Math.random() * 101),
    leadValue: Math.floor(Math.random() * 50000) + 1000,
    lastActivityAt: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : null,
    isQualified: Math.random() > 0.6,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
  };
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    // Create demo user (password will be hashed by the User model pre-save hook)
    const demoUser = new User({
      email: 'demo@leadmanagement.com',
      password: 'demo123', // This will be hashed automatically
      firstName: 'Demo',
      lastName: 'User'
    });
    await demoUser.save();
    console.log('Created demo user');

    // Generate 150 leads for demo user
    const leads = [];
    for (let i = 0; i < 150; i++) {
      leads.push(generateRandomLead(demoUser._id));
    }

    await Lead.insertMany(leads);
    console.log('Created 150 demo leads');

    console.log('✅ Seed data created successfully!');
    console.log('Demo credentials:');
    console.log('Email: demo@leadmanagement.com');
    console.log('Password: demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();