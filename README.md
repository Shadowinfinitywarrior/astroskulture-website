# Astros Kulture E-Commerce Platform

A full-stack e-commerce platform with admin control panel, built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

### Customer Features
- Browse products by category
- View detailed product information
- Add products to cart
- Checkout process with shipping information
- User authentication and registration

### Admin Features
- Secure admin login portal
- Dashboard with statistics overview
- Complete product management (CRUD operations)
- Order management and status updates
- User account management
- Real-time data synchronization with MongoDB

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for build tooling

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (connection string provided)

### Installation

1. **Install Frontend Dependencies**
```bash
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
cd ..
```

### Running the Application

You need to run both the backend server and frontend development server:

1. **Start Backend Server** (Terminal 1)
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

2. **Start Frontend Dev Server** (Terminal 2)
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## Admin Access

Access the admin control panel at: `http://localhost:5173/admin`

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## Admin Panel Features

### Dashboard
- Total products count
- Total orders count
- Total users count
- Total revenue statistics
- Quick action links

### Products Management
- View all products in a table
- Add new products with image URLs
- Edit existing products
- Delete products
- Set featured products
- Manage stock levels

### Orders Management
- View all customer orders
- Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- View detailed order information
- See shipping addresses
- Delete orders

### Users Management
- View all registered users
- Create new user accounts
- Edit user information
- Delete user accounts
- Manage user roles (Customer/Admin)

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/orders` - Create order
- `POST /api/users` - Register user

### Admin Protected Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/orders` - Get all orders
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Database Configuration

The MongoDB connection is already configured in `backend/.env`

## Project Structure

```
astros-kulture/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── server.js        # Express server
│   ├── .env                 # Environment variables
│   └── package.json
├── src/
│   ├── components/
│   │   ├── admin/           # Admin components
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── contexts/            # React contexts
│   │   ├── AdminAuthContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ShopPage.tsx
│   ├── lib/                 # Utilities
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## Building for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

## Notes

- The admin panel requires the backend server to be running
- All admin routes are protected with JWT authentication
- Product images should be provided as URLs
- MongoDB Atlas handles database hosting
