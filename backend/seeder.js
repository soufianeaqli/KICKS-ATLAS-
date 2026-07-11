import mongoose from 'mongoose';
import dotenv from 'dotenv';
import products from './data/products.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import bcrypt from 'bcryptjs';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/football-fashion');

const importData = async () => {
  try {
    // Clear all existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Create users (just a dummy admin for now)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    const createdUsers = await User.insertMany([
      { name: 'Admin User', email: 'admin@admin.com', password: hashedPassword, role: 'admin' }
    ]);
    const adminUser = createdUsers[0]._id;

    // Attach admin as creator if needed (currently not hard-required in schema, but good practice if schema upgrades)
    // Product schema currently doesn't require user, but let's insert products.
    await Product.insertMany(products);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
