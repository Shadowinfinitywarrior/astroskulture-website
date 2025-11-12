# 📁 File Structure Reference

## Project Architecture

```
astro-main/
├── backend/                           # Express.js server
│   ├── src/
│   │   ├── server.js                 # Main server file
│   │   ├── models/                   # MongoDB schemas
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── User.js
│   │   │   ├── Admin.js
│   │   │   ├── Category.js           # ✅ Categories model
│   │   │   ├── Banner.js             # ✅ Banners model
│   │   │   └── Blog.js               # ✅ Blogs model
│   │   ├── routes/                   # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── users.js
│   │   │   ├── admin.js
│   │   │   ├── categories.js         # ✅ Categories endpoints
│   │   │   ├── banners.js            # ✅ Banners endpoints
│   │   │   └── blogs.js              # ✅ Blogs endpoints
│   │   ├── controllers/              # Business logic
│   │   ├── middleware/               # Auth, validation
│   │   └── scripts/                  # Utility scripts
│   ├── .env                          # Environment variables
│   └── package.json
│
├── src/                              # React frontend
│   ├── App.tsx                       # ✅ Updated with blog routing
│   ├── main.tsx                      # App entry point
│   ├── vite-env.d.ts                # Vite type definitions
│   ├── index.css                    # Global styles
│   │
│   ├── components/
│   │   ├── Navbar.tsx               # ✅ Updated with blog link
│   │   ├── Footer.tsx
│   │   ├── ProductImageGallery.tsx
│   │   └── admin/
│   │       └── AdminLayout.tsx       # ✅ Updated with blog menu item
│   │
│   ├── pages/
│   │   ├── HomePage.tsx             # ✅ Banners + Category carousel
│   │   ├── ShopPage.tsx             # ✅ Hidden filters + 2/3 grid
│   │   ├── ProductPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── WishlistPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── UserAccountPage.tsx
│   │   ├── UserOrdersPage.tsx
│   │   ├── BlogPage.tsx             # ✅ Blog listing page
│   │   ├── BlogDetailPage.tsx       # ✅ Blog detail page
│   │   ├── ProductCard.tsx
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AdminProductsPage.tsx
│   │       ├── AdminOrdersPage.tsx
│   │       ├── AdminUsersPage.tsx
│   │       ├── AdminCategoriesPage.tsx  # ✅ Category management
│   │       ├── AdminBannersPage.tsx     # ✅ Banner management
│   │       └── AdminBlogPage.tsx        # ✅ NEW - Blog management
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx          # User authentication
│   │   ├── AdminAuthContext.tsx     # Admin authentication
│   │   ├── CartContext.tsx          # Shopping cart
│   │   └── WishlistContext.tsx      # Wishlist
│   │
│   ├── lib/
│   │   ├── mongodb.ts               # ✅ API service with all methods
│   │   └── types.ts                 # TypeScript interfaces
│   │
│   └── public/
│       ├── logo.png
│       ├── favicon.ico
│       └── vite.svg
│
├── Documentation/                   # ✅ NEW - Created this session
│   ├── SESSION_SUMMARY.md           # Technical overview
│   ├── DEPLOYMENT_CHECKLIST.md      # Testing & deployment
│   ├── ADMIN_QUICK_GUIDE.md         # Admin user guide
│   ├── FILE_STRUCTURE_REFERENCE.md  # This file
│   ├── FEATURE_CHECKLIST.md         # Feature verification
│   ├── IMPLEMENTATION_SUMMARY.md    # Previous implementation
│   └── README_FIXES.md              # Previous fixes
│
├── .env.production                  # Production env vars
├── .gitignore
├── package.json                     # Frontend dependencies
├── package-lock.json
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
├── tailwind.config.js               # Tailwind CSS config
├── postcss.config.js                # PostCSS config
├── eslint.config.js                 # ESLint config
└── README.md                        # Project README
```

---

## Key Files Modified This Session

### 1. **Created** ✨
```
src/pages/admin/AdminBlogPage.tsx
```
- Complete blog management interface
- Full CRUD functionality
- Image preview support
- Content editor

### 2. **Updated** 📝
```
src/App.tsx
- Added AdminBlogPage import
- Added /admin/blogs route detection
- Added admin-blogs routing rule
- Added admin-blogs case in switch

src/components/admin/AdminLayout.tsx
- Added BookOpen icon import
- Added "Blogs" menu item

src/pages/admin/AdminBannersPage.tsx
- Removed unused API_BASE_URL constant
```

---

## Important Components

### API Service (`src/lib/mongodb.ts`)
**Location**: Line 330-430

```typescript
// Category Methods
getCategories()              // Public list
getCategoriesWithCounts()    // With product count
adminGetAllCategories()      // Admin list
adminCreateCategory()        // Create
adminUpdateCategory()        // Update
adminDeleteCategory()        // Delete

// Banner Methods
getBanners()                 // Public list (active)
adminGetAllBanners()         // Admin list (all)
adminCreateBanner()          // Create
adminUpdateBanner()          // Update
adminDeleteBanner()          // Delete

// Blog Methods
getBlogs()                   // Public list (published)
getBlog(slug)                // Get single
adminGetAllBlogs()           // Admin list (all)
adminCreateBlog()            // Create
adminUpdateBlog()            // Update
adminDeleteBlog()            // Delete
```

### Admin Layout (`src/components/admin/AdminLayout.tsx`)
**Navigation Menu Items**:
1. Dashboard
2. Products
3. Orders
4. Users
5. Categories
6. Banners
7. Blogs ← NEW

### Routes (`src/App.tsx`)
**Admin Routes**:
```
/admin              → AdminDashboardPage
/admin/products     → AdminProductsPage
/admin/orders       → AdminOrdersPage
/admin/users        → AdminUsersPage
/admin/categories   → AdminCategoriesPage
/admin/banners      → AdminBannersPage
/admin/blogs        → AdminBlogPage ← NEW
```

**Public Routes**:
```
/                   → HomePage
/shop               → ShopPage
/product/:slug      → ProductPage
/cart               → CartPage
/checkout           → CheckoutPage
/wishlist           → WishlistPage
/blog               → BlogPage ← NEW
/blog/:slug         → BlogDetailPage ← NEW
/login              → LoginPage
/register           → RegisterPage
/account            → UserAccountPage
/orders             → UserOrdersPage
```

---

## Component Relationships

```
App.tsx
├── Navbar (All pages)
│   ├── Home link
│   ├── Shop link
│   ├── Blog link ← NEW
│   ├── Cart link
│   └── User menu
├── HomePage
│   ├── Banner carousel ← ENHANCED
│   ├── Category carousel ← ENHANCED
│   └── Featured products
├── ShopPage
│   ├── Filter toggle (mobile) ← NEW
│   ├── Filter sidebar ← UPDATED
│   └── Product grid (2/3 cols) ← UPDATED
├── BlogPage ← NEW
│   ├── Blog cards
│   ├── Tag filter
│   └── Links to detail
├── BlogDetailPage ← NEW
│   ├── Full content
│   ├── Metadata
│   └── Back link
├── AdminLayout
│   ├── Sidebar navigation
│   │   ├── Dashboard
│   │   ├── Products
│   │   ├── Orders
│   │   ├── Users
│   │   ├── Categories
│   │   ├── Banners
│   │   └── Blogs ← NEW
│   └── Main content
│       ├── AdminBlogPage ← NEW
│       ├── AdminCategoriesPage
│       ├── AdminBannersPage
│       └── Other admin pages
└── Footer
```

---

## Data Models

### Blog Schema
```javascript
{
  _id: ObjectId,
  title: String,              // Blog title
  slug: String,               // Auto-generated from title
  excerpt: String,            // Short summary
  content: String,            // Full HTML content
  imageUrl: String,           // Blog thumbnail
  publishedAt: Date,          // Publication date
  views: Number,              // View count
  tags: [String],             // Array of tags
  published: Boolean,         // Publish status
  createdAt: Date,
  updatedAt: Date
}
```

### Banner Schema
```javascript
{
  _id: ObjectId,
  discountPercentage: Number, // 1-100
  backgroundColor: String,    // Hex color
  textColor: String,          // Hex color
  displayOrder: Number,       // Priority order
  isActive: Boolean,          // Active status
  createdAt: Date,
  updatedAt: Date
}
```

### Category Schema
```javascript
{
  _id: ObjectId,
  name: String,               // Category name
  slug: String,               // Auto-generated
  imageUrl: String,           // Category image
  description: String,        // Category description
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Blog Endpoints
```
POST   /api/blogs               # Create blog (Admin)
GET    /api/blogs               # List published blogs
GET    /api/blogs/:slug         # Get single blog
PUT    /api/blogs/:id           # Update blog (Admin)
DELETE /api/blogs/:id           # Delete blog (Admin)
GET    /api/blogs/admin/all     # All blogs (Admin)
```

### Banner Endpoints
```
POST   /api/banners             # Create banner (Admin)
GET    /api/banners             # List active banners
PUT    /api/banners/:id         # Update banner (Admin)
DELETE /api/banners/:id         # Delete banner (Admin)
GET    /api/banners/admin/all   # All banners (Admin)
```

### Category Endpoints
```
POST   /api/categories          # Create category (Admin)
GET    /api/categories          # List categories
PUT    /api/categories/:id      # Update category (Admin)
DELETE /api/categories/:id      # Delete category (Admin)
GET    /api/admin/categories    # Admin list (Admin)
```

---

## Development Workflow

### Adding a New Admin Feature

1. **Create Admin Page**
```typescript
// src/pages/admin/AdminFeaturePage.tsx
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminFeaturePage({ onNavigate }) {
  return (
    <AdminLayout currentPage="feature" onNavigate={onNavigate}>
      {/* Your content */}
    </AdminLayout>
  );
}
```

2. **Update App.tsx**
```typescript
// Import
import AdminFeaturePage from './pages/admin/AdminFeaturePage';

// Add route detection
if (path === '/admin/feature') {
  setCurrentPage('admin-feature');
}

// Add to routes map
const routes = {
  'admin-feature': '/admin/feature',
};

// Add case in AdminRoutes
case 'admin-feature':
  return <AdminFeaturePage onNavigate={onNavigate} />;
```

3. **Update AdminLayout**
```typescript
// Add to navigation array
{ name: 'Feature', icon: Icon, page: 'feature', target: 'admin-feature' }
```

4. **API Service Methods**
```typescript
// src/lib/mongodb.ts
async adminGetAllFeatures() {
  return this.request('/admin/features', {}, true);
}

async adminCreateFeature(data) {
  return this.request('/admin/features', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}
// ... other CRUD methods
```

---

## Testing Files Modified

### Blog Page Testing
- Check images load
- Verify tag filtering
- Test navigation

### Shop Page Testing
- Test filter toggle on mobile
- Check 2-column layout on mobile
- Check 3-column on desktop

### Homepage Testing
- Banner animation smooth
- Category carousel responsive
- Products display

### Admin Testing
- Create/edit/delete blogs
- Verify API calls
- Check error handling

---

## Performance Tips

### Frontend Optimization
- ✅ CSS keyframes for animations (not JS)
- ✅ Lazy loading for images
- ✅ Efficient re-renders
- ✅ Optimized bundle size

### API Optimization
- ✅ Pagination for lists
- ✅ Caching where applicable
- ✅ Efficient database queries
- ✅ Proper indexing

### Mobile Optimization
- ✅ Touch-friendly buttons (44x44px)
- ✅ Responsive images
- ✅ Optimized CSS
- ✅ Minimal JavaScript

---

## Security Considerations

### Authentication
- ✅ JWT tokens used
- ✅ Admin token separate from user token
- ✅ Tokens stored in localStorage
- ✅ CORS properly configured

### Data Protection
- ✅ Password hashing
- ✅ Validation on frontend and backend
- ✅ Admin routes protected
- ✅ User data isolated

### API Security
- ✅ HTTPS in production
- ✅ Proper error messages
- ✅ Rate limiting recommended
- ✅ Input validation

---

## Deployment Considerations

### Environment Variables
```
# Frontend (.env)
VITE_API_BASE_URL=https://api-url.com/api

# Backend (.env)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
ADMIN_SECRET=admin-secret
PORT=5000
NODE_ENV=production
CLIENT_URL=https://frontend-url.com
```

### Build Process
```bash
# Frontend
npm run build
# Output: dist/

# Backend
# No build needed (Node.js)
npm install
npm start
```

### Deployment Checklist
- [ ] Build frontend
- [ ] Deploy backend
- [ ] Set environment variables
- [ ] Test all features
- [ ] Monitor logs
- [ ] Check performance

---

## Documentation Files

This session created:
1. **SESSION_SUMMARY.md** - Complete technical overview
2. **DEPLOYMENT_CHECKLIST.md** - Testing & deployment guide
3. **ADMIN_QUICK_GUIDE.md** - User-friendly admin guide
4. **FILE_STRUCTURE_REFERENCE.md** - This file
5. **FEATURE_CHECKLIST.md** - Feature verification

---

## Quick Reference

### Common Commands
```bash
# Frontend
npm install          # Install dependencies
npm run dev         # Development server
npm run build       # Production build

# Backend
npm install         # Install dependencies
npm start           # Start server
npm run dev         # Development with auto-reload

# Testing
npm test            # Run tests
npm run lint        # Lint code
```

### Common Imports
```typescript
import { apiService } from '../lib/mongodb';
import AdminLayout from '../../components/admin/AdminLayout';
import { useState, useEffect } from 'react';
```

### Common Hooks
```typescript
const [state, setState] = useState(initialValue);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
useEffect(() => { /* effect */ }, [dependencies]);
```

---

**Last Updated**: This Session ✅  
**Status**: Complete & Ready  
**Version**: 1.0.0  