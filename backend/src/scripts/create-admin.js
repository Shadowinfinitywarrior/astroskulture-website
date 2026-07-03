import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from '../models/Admin.js';

// Fix for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root backend directory or project root
let envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
    envPath = path.resolve(__dirname, '../../../.env');
    console.log('📁 MONGODB_URI not found in backend/.env, checking project root:', envPath);
    dotenv.config({ path: envPath });
} else {
    console.log('📁 Loaded environment from:', envPath);
}

const createAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);

        const adminData = {
            username: 'admin',
            password: 'admin123', // You should change this after login!
            email: 'admin@astroskulture.in',
            fullName: 'System Administrator',
            role: 'admin'
        };

        // Check if admin exists
        const existingAdmin = await Admin.findOne({
            $or: [{ username: adminData.username }, { email: adminData.email }]
        });

        if (existingAdmin) {
            console.log('⚠️ Admin user already exists');
            console.log('Username:', existingAdmin.username);

            // Update password
            existingAdmin.password = adminData.password;
            await existingAdmin.save();
            console.log('✅ Admin password updated/reset to default: admin123');
        } else {
            const newAdmin = new Admin(adminData);
            await newAdmin.save();
            console.log('✅ Admin user created successfully!');
            console.log('Username:', adminData.username);
            console.log('Password:', adminData.password);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
