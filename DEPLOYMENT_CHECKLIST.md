# 🚀 Deployment & Testing Checklist

## Pre-Deployment Verification

### 1. Environment Setup
- [ ] `.env` file has `VITE_API_BASE_URL` set correctly
- [ ] Backend `.env` has `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SECRET` configured
- [ ] Backend running on correct PORT (default: 5000)
- [ ] Frontend build configured for correct API URL

### 2. Backend Services
```bash
# Start backend server
cd backend
npm install
npm start

# Expected output:
# ✅ Connected to MongoDB successfully
# 🚀 ASTRO-MAIN Server Started Successfully
# 📡 API Base URL: http://localhost:5000/api
```

### 3. Frontend Services
```bash
# Start frontend (from root)
npm install
npm run dev

# Expected output:
# VITE v... ready in ... ms
# ➜  Local: http://localhost:5173/
```

---

## Feature Testing Checklist

### ✅ Admin Blog Management
**Navigate to**: `/admin/blogs` (Login required)

**Test Items**:
- [ ] Create new blog post
  - [ ] Fill in title, excerpt, content
  - [ ] Add image URL (verify preview shows)
  - [ ] Add tags (comma-separated)
  - [ ] Toggle publish/draft
  - [ ] Click "Create" button
  - [ ] Success message appears
  - [ ] Blog shows in table

- [ ] Edit blog post
  - [ ] Click "Edit" on any blog
  - [ ] Modify content
  - [ ] Click "Update" button
  - [ ] Success message appears
  - [ ] Changes reflected in table

- [ ] Delete blog post
  - [ ] Click "Delete" on any blog
  - [ ] Confirm deletion in dialog
  - [ ] Blog removed from table
  - [ ] Success message appears

- [ ] Publish/Unpublish
  - [ ] Toggle "Publish" checkbox
  - [ ] Update blog
  - [ ] Status updates in list (Published/Draft)

---

### ✅ Admin Category Management
**Navigate to**: `/admin/categories` (Login required)

**Test Items**:
- [ ] Create category
  - [ ] Fill name, slug, description, image URL
  - [ ] Preview image appears
  - [ ] Category added to list

- [ ] Edit category
  - [ ] Click "Edit"
  - [ ] Modify details
  - [ ] Changes reflected in list

- [ ] Delete category
  - [ ] Click "Delete"
  - [ ] Confirm and verify removal

---

### ✅ Admin Banner Management
**Navigate to**: `/admin/banners` (Login required)

**Test Items**:
- [ ] Create banner
  - [ ] Enter discount percentage
  - [ ] Pick background color
  - [ ] Pick text color
  - [ ] Set display order
  - [ ] Toggle active status
  - [ ] Live preview updates colors

- [ ] Edit and delete banners
  - [ ] Verify changes work
  - [ ] Deletion works correctly

- [ ] Homepage display
  - [ ] Navigate to home page
  - [ ] Banners display at top
  - [ ] Colors match admin settings
  - [ ] Animation loops smoothly

---

### ✅ Homepage Features
**Navigate to**: `/` (Public)

**Test Items**:
- [ ] Promotional Banners
  - [ ] Display with correct colors
  - [ ] Text scrolls smoothly
  - [ ] Only active banners show
  - [ ] Sorted by display order

- [ ] Category Carousel
  - **Desktop (> 768px)**:
    - [ ] 4-column grid shows
    - [ ] All categories visible
    - [ ] Click category → filters shop
  
  - **Mobile (< 768px)**:
    - [ ] Horizontal scroll visible
    - [ ] Left/right navigation buttons work
    - [ ] Click category → filters shop

- [ ] Featured Products
  - [ ] Display under categories
  - [ ] Images load correctly
  - [ ] Prices display
  - [ ] Add to cart works

---

### ✅ Blog System
**Test Items**:
- [ ] Blog Page (`/blog`)
  - [ ] All published blogs show
  - [ ] Images display correctly
  - [ ] Tags filter works
  - [ ] Click blog → detail page

- [ ] Blog Detail Page (`/blog/:slug`)
  - [ ] Full content displays
  - [ ] Images render
  - [ ] Metadata (date, views) shows
  - [ ] Tags display
  - [ ] Can navigate back to blog list

- [ ] Navbar Blog Link
  - [ ] "Blog" link visible in navbar
  - [ ] Highlights when on blog page
  - [ ] Mobile menu includes blog link

---

### ✅ Shop Page & Responsive Design
**Navigate to**: `/shop`

**Test Items**:
- **Mobile View (< 768px)**:
  - [ ] "Show Filters" button visible
  - [ ] Filters hidden by default
  - [ ] Click "Show Filters" → filters display
  - [ ] Click "Hide Filters" → filters hide
  - [ ] Product grid is 2 columns
  - [ ] Scrolls vertically smoothly

- **Tablet View (768px - 1024px)**:
  - [ ] Filters visible in sidebar
  - [ ] Product grid is 3 columns
  - [ ] Layout balanced

- **Desktop View (> 1024px)**:
  - [ ] Filters always visible
  - [ ] Product grid is 3 columns
  - [ ] Full navigation bar

- **Filter Functionality**:
  - [ ] Category filter works
  - [ ] Price range slider works
  - [ ] Search bar works
  - [ ] Sort dropdown works
  - [ ] Clear filters button works

---

### ✅ API Service Integration
**Test Items**:
- [ ] All CRUD operations use API service
- [ ] No hardcoded API URLs in components
- [ ] Admin operations use admin token
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Success notifications work

---

## Responsive Design Testing

### Browser Developer Tools
```
Use Chrome DevTools:
1. Press F12
2. Click device toggle icon (Ctrl+Shift+M)
3. Test different screen sizes:
   - iPhone SE (375px)
   - iPhone 12 (390px)
   - iPad (768px)
   - Desktop (1920px)
```

### Test Cases
- [ ] All text is readable
- [ ] Images scale properly
- [ ] Buttons are tappable (> 44x44px)
- [ ] No horizontal scroll
- [ ] Touch interactions work
- [ ] Dropdown menus work on mobile

---

## Production Deployment

### Build Frontend
```bash
# From root directory
npm run build

# Check build output
# dist/
#   ├── index.html
#   ├── assets/
#   └── ...
```

### Deploy to Render/Heroku
```bash
# For backend
git add .
git commit -m "Production ready"
git push heroku main

# Check deployment logs
heroku logs --tail
```

### Verify Production
- [ ] API health check: `https://api-url/api/health`
- [ ] Frontend loads without errors
- [ ] All features work in production
- [ ] CORS headers correct
- [ ] Database connection stable

---

## Performance Checks

### Frontend Performance
```bash
# Check bundle size
npm run build

# Expected:
# - dist/index.html: < 20KB
# - CSS bundle: < 50KB
# - JS bundle: < 500KB
```

### API Performance
- [ ] Banners load in < 500ms
- [ ] Categories load in < 500ms
- [ ] Blogs load in < 500ms
- [ ] Products load in < 1000ms

---

## Error Handling

### Test Error Scenarios
- [ ] Network down → error message displays
- [ ] Invalid admin token → redirects to login
- [ ] API error 500 → user-friendly message
- [ ] Form validation errors → highlighted fields
- [ ] Delete confirmation → prevents accidents

---

## Browser Compatibility

### Test on Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Final Verification

### Checklist
- [ ] All features implemented
- [ ] No console errors
- [ ] No console warnings
- [ ] Responsive on all devices
- [ ] API calls working
- [ ] Authentication working
- [ ] Error messages helpful
- [ ] Loading states visible
- [ ] Success notifications working
- [ ] Database connected
- [ ] Deployment successful
- [ ] Production URLs working

---

## Quick Debug Commands

### Backend
```bash
# Check MongoDB connection
curl http://localhost:5000/api/health

# Check available routes
curl http://localhost:5000/api

# Check admin auth
curl -X GET http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend (Console)
```javascript
// Check API service configuration
apiService.API_BASE_URL

// Check user authentication
localStorage.getItem('token')

// Check admin authentication
localStorage.getItem('adminToken')

// Check current page
window.location.pathname
```

---

## Support & Troubleshooting

### Common Issues

**Issue**: Blog creation fails
- [ ] Check admin is logged in
- [ ] Check admin token in localStorage
- [ ] Check API is running
- [ ] Check MongoDB is connected

**Issue**: Banners not showing
- [ ] Check banners are marked as active
- [ ] Check at least one banner exists
- [ ] Check API returns data
- [ ] Check frontend is fetching data

**Issue**: Responsive layout broken
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Check Tailwind CSS is compiled
- [ ] Check viewport meta tag exists
- [ ] Test on different browsers

**Issue**: API errors
- [ ] Check CORS configuration
- [ ] Check API URL is correct
- [ ] Check auth headers present
- [ ] Check request payload format

---

## Success Criteria ✅

- ✅ All admin pages accessible
- ✅ All CRUD operations work
- ✅ Homepage displays correctly
- ✅ Blog system functional
- ✅ Shop filters work
- ✅ Responsive design works
- ✅ No console errors
- ✅ Production deployment successful
- ✅ All features tested
- ✅ Ready for users

---

**Deployment Status**: ✅ READY

Proceed with deployment when all checklist items are complete.