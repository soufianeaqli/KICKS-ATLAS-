import mongoose from 'mongoose';
import Order from './backend/models/Order.js';

mongoose.connect('mongodb://127.0.0.1:27017/football-fashion')
  .then(async () => {
    const o = await Order.find({});
    console.log(JSON.stringify(o.map(x => x.giftItem).filter(Boolean), null, 2));
    process.exit();
  });
