import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST - before any other imports
dotenv.config();

// Fix for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Debug environment variables
console.log('🔧 Environment Variables Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ MISSING');
console.log('PORT:', process.env.PORT || '5000 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');

// Import routes after environment variables are loaded
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('💡 Please check your .env file in the backend directory');
  process.exit(1);
}

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false // Same origin in production
    : process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with comprehensive error handling
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Attempting MongoDB connection...');
// Log masked URI (hide password)
const maskedUri = MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@');
console.log('📦 Database:', maskedUri);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName || 'Unknown'}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:');
    console.error('   Error:', err.message);
    console.error('   Code:', err.code);
    console.error('   Name:', err.name);
    
    if (err.code === 'ENOTFOUND') {
      console.error('💡 Network issue: Cannot connect to MongoDB Atlas');
      console.error('💡 Check your internet connection and MongoDB Atlas IP whitelist');
    } else if (err.code === 'ETIMEOUT') {
      console.error('💡 Connection timeout: MongoDB server is not responding');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('💡 Connection refused: Check if MongoDB is running');
    }
    
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check your MongoDB connection string in .env file');
    console.error('   2. Verify your MongoDB Atlas cluster is running');
    console.error('   3. Check your network connection');
    console.error('   4. Ensure IP is whitelisted in MongoDB Atlas');
    
    process.exit(1);
  });

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🟢 Mongoose reconnected to MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  console.log('🏗️  Production mode: Serving React static files');
  
  // Serve static files from the React app build
  app.use(express.static(path.join(__dirname, '../../dist')));

  // The "catchall" handler: for any request that doesn't match API routes
  app.get('*', (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        success: false, 
        message: 'API route not found' 
      });
    }
    
    console.log(`📄 Serving React app for: ${req.path}`);
    // Serve React app for all other routes
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const healthStatus = dbStatus === 1 ? 'healthy' : 'unhealthy';
  
  res.json({ 
    success: true,
    status: healthStatus,
    message: 'ASTRO-MAIN API Server Health Check',
    timestamp: new Date().toISOString(),
    database: {
      status: statusMap[dbStatus] || 'unknown',
      readyState: dbStatus
    },
    server: {
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      uptime: process.uptime()
    },
    staticFiles: process.env.NODE_ENV === 'production' ? 'serving React build' : 'development mode',
    routes: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      categories: '/api/categories',
      admin: '/api/admin'
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ASTRO-MAIN API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    deployment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verify: 'GET /api/auth/verify',
        adminLogin: 'POST /api/auth/admin/login'
      },
      products: {
        list: 'GET /api/products',
        get: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      orders: {
        list: 'GET /api/orders',
        create: 'POST /api/orders',
        get: 'GET /api/orders/:id',
        myOrders: 'GET /api/orders/my-orders',
        updateStatus: 'PUT /api/orders/:id/status',
        updatePayment: 'PUT /api/orders/:id/payment'
      },
      users: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        addAddress: 'POST /api/users/address',
        updateAddress: 'PUT /api/users/address/:addressId',
        getAllUsers: 'GET /api/users',
        getUserById: 'GET /api/users/:id',
        deleteUser: 'DELETE /api/users/:id'
      },
      categories: {
        list: 'GET /api/categories'
      },
      admin: {
        products: 'GET /api/admin/products',
        orders: 'GET /api/admin/orders',
        users: 'GET /api/admin/users',
        createProduct: 'POST /api/admin/products',
        updateProduct: 'PUT /api/admin/products/:id',
        deleteProduct: 'DELETE /api/admin/products/:id',
        updateOrderStatus: 'PUT /api/admin/orders/:id/status',
        deleteOrder: 'DELETE /api/admin/orders/:id',
        createUser: 'POST /api/admin/users',
        updateUser: 'PUT /api/admin/users/:id',
        deleteUser: 'DELETE /api/admin/users/:id'
      }
    },
    authentication: {
      note: 'Most routes require JWT authentication',
      header: 'Authorization: Bearer <token>'
    }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled Error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Check the /api endpoint for available routes',
    availableRoutes: [
      '/api/auth',
      '/api/products', 
      '/api/orders',
      '/api/users',
      '/api/categories',
      '/api/admin',
      '/api/health'
    ]
  });
});

app.listen(PORT, () => {
  console.log('\n🚀 ASTRO-MAIN Server Started Successfully');
  console.log('═'.repeat(60));
  console.log(`📍 Server Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🛜 Server Ready: http://localhost:${PORT}`);
  console.log('═'.repeat(60));
  console.log('📋 Available Routes:');
  console.log('   AUTH       /api/auth');
  console.log('   PRODUCTS   /api/products');
  console.log('   ORDERS     /api/orders');
  console.log('   USERS      /api/users');
  console.log('   CATEGORIES /api/categories');
  console.log('   ADMIN      /api/admin');
  console.log('═'.repeat(60));
  console.log('🔐 Protected Routes (require JWT):');
  console.log('   • /api/orders/*');
  console.log('   • /api/users/profile');
  console.log('   • /api/users/address');
  console.log('   • /api/admin/*');
  console.log('═'.repeat(60));
  
  // Additional production info
  if (process.env.NODE_ENV === 'production') {
    console.log('🏗️  Production Mode: Serving React frontend from /dist');
  }
});