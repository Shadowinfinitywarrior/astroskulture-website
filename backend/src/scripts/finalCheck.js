import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js'; // I'll assume standard model names
import Order from '../models/Order.js';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        return false;
    }
};

const emailsToCheck = [
    'valavan13@gmail.com',
    'valla7@gmail.com',
    'srihari06haran@gmail.com',
    'nithishkathiravan123@gmail.com',
    'jawsprime363@gmail.com',
    'arunkumarrajan2005@gmail.com',
    'sahayadaphnie37@gmail.com'
];

const checkUsersAndOrders = async () => {
    const isConnected = await connectDB();
    if (!isConnected) return;

    try {
        console.log('🔍 Checking Users and their Orders in DB...\n');

        for (const email of emailsToCheck) {
            console.log(`Email: ${email}`);
            const user = await mongoose.connection.db.collection('users').findOne({ email });

            if (user) {
                console.log(`✅ USER FOUND: ID ${user._id}, Name: ${user.fullName}`);
                const orders = await Order.find({ userId: user._id });
                console.log(`📦 ORDERS IN DB: ${orders.length}`);
                orders.forEach(o => console.log(`   - Order ${o.orderNumber}, Status: ${o.status}, Payment Status: ${o.paymentStatus}`));
            } else {
                console.log('❌ USER NOT FOUND in database.');
            }
            console.log('--------------------------------------------------------------------------------');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

checkUsersAndOrders();
