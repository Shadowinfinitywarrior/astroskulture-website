# Astros Kulture Backend API

Node.js/Express backend with MongoDB for the Astros Kulture e-commerce platform.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
The `.env` file is already configured with:
- MongoDB connection string
- Admin credentials (username: admin, password: admin123)
- JWT secret key
- Server port (5000)

### 3. Start the Server
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify admin token

### Products (Public)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Products (Admin Only)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders (Admin Only)
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Orders (Public)
- `POST /api/orders` - Create order

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Users (Public)
- `POST /api/users` - Create user (registration)

## Admin Access

Default admin credentials:
- Username: `admin`
- Password: `admin123`

Access the admin panel at: `http://localhost:5173/admin`

## Database Schema

### Products
- name, description, price, category, image, stock, featured

### Orders
- userId, items[], totalAmount, status, shippingAddress, paymentMethod

### Users
- email, password, firstName, lastName, phone, address, role

### Admin
- username, password, email, fullName, role
