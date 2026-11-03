import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from '../models/Admin.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
let envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

if (!process.env.MONGODB_URI) {
  envPath = path.resolve(__dirname, '../../../.env');
  dotenv.config({ path: envPath });
}

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/astromain';

  if (primaryUri) {
    try {
      console.log('🔗 Connecting to primary database (Atlas)...');
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
      console.log('✅ Connected to primary MongoDB:', mongoose.connection.name);
      return;
    } catch (err) {
      console.warn('⚠️ Primary database connection timed out. Falling back to local database...');
    }
  }

  console.log('🔗 Connecting to local database (127.0.0.1:27017)...');
  await mongoose.connect(localUri);
  console.log('✅ Connected to local MongoDB:', mongoose.connection.name);
};

const defaultAdminPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD || 'AstrosSecureAdmin2026!';

const adminsToEnsure = [
  {
    username: 'REDACTED_ADMIN_PASS',
    email: 'astroskulture4@gmail.com',
    password: defaultAdminPassword,
    fullName: 'Astros Kulture Admin',
    role: 'admin'
  },
  {
    username: 'Nithish',
    email: 'kathiravankathiravan973@gmail.com',
    password: defaultAdminPassword,
    fullName: 'Nithish',
    role: 'admin'
  }
];

const setupAdmins = async () => {
  try {
    await connectDB();

    // 1. Remove insecure default admin account(s) (username: 'admin')
    const deleteResult = await Admin.deleteMany({
      $or: [
        { username: 'admin' },
        { email: 'admin@astroskulture.in' },
        { email: 'admin@astroskulture.com' }
      ]
    });
    if (deleteResult.deletedCount > 0) {
      console.log(`🗑️ Removed ${deleteResult.deletedCount} default/insecure admin account(s) (username: 'admin').`);
    }

    // 2. Upsert each admin
    for (const adminData of adminsToEnsure) {
      let admin = await Admin.findOne({
        $or: [
          { username: adminData.username },
          { email: adminData.email.toLowerCase() }
        ]
      });

      if (admin) {
        admin.username = adminData.username;
        admin.email = adminData.email.toLowerCase();
        admin.fullName = adminData.fullName;
        admin.password = adminData.password; // Pre-save hook hashes with bcrypt
        admin.role = 'admin';
        await admin.save();
        console.log(`✅ Admin updated: ${admin.username} (${admin.email})`);
      } else {
        admin = new Admin({
          ...adminData,
          email: adminData.email.toLowerCase()
        });
        await admin.save();
        console.log(`✅ Admin created: ${admin.username} (${admin.email})`);
      }

      // Also ensure corresponding User account has admin role
      let user = await User.findOne({ email: adminData.email.toLowerCase() });
      if (user) {
        user.fullName = adminData.fullName;
        user.role = 'admin';
        user.password = adminData.password;
        await user.save();
        console.log(`✅ Store user updated: ${adminData.email} (role: admin)`);
      } else {
        user = new User({
          email: adminData.email.toLowerCase(),
          fullName: adminData.fullName,
          password: adminData.password,
          role: 'admin'
        });
        await user.save();
        console.log(`✅ Store user created: ${adminData.email} (role: admin)`);
      }
    }

    // Purge old admin from User collection if present
    await User.deleteMany({ email: { $in: ['admin@astroskulture.in', 'admin@astroskulture.com'] } });

    await mongoose.connection.close();
    console.log('🎉 Admin accounts configured successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admins:', error);
    process.exit(1);
  }
};

setupAdmins();
