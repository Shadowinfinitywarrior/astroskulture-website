# Testing Guide - Verify All Fixes

This guide will help you verify that all bugs have been fixed correctly.

---

## Prerequisites

Before testing, ensure:
- ✅ Backend server is running (`npm start` in `/backend`)
- ✅ Frontend is running (`npm run dev` in root)
- ✅ MongoDB is connected
- ✅ Browser cache is cleared

**Check Backend Status:**
```bash
# Terminal: Open port 5000 in browser
http://localhost:5000/api/health

# Should see: "{"success": true, "message": "API is running"}"
```

---

## Test 1: Wishlist Route Operations

### Objective: Verify all wishlist endpoints work correctly after route reordering

### Test Steps:

#### 1.1 Get Wishlist Count Endpoint ✅
```
URL: http://localhost:5000/api/wishlist/count
Method: GET
Headers: 
  - Authorization: Bearer [user-token]
  - Content-Type: application/json

Expected Response:
{
  "success": true,
  "data": { "count": 0 }
}

Status: 200 OK ✅
```

**How to test:**
1. Login to user account
2. Open browser DevTools (F12)
3. Go to Console tab
4. Paste:
```javascript
fetch('http://localhost:5000/api/wishlist/count', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(console.log)
```
5. Should see `{ success: true, data: { count: 0 } }`

#### 1.2 Check Product in Wishlist ✅
```
URL: http://localhost:5000/api/wishlist/check/[PRODUCT_ID]
Method: GET
Headers: Authorization Bearer [token]

Expected: 
{
  "success": true,
  "data": { "inWishlist": false }
}
```

#### 1.3 Add to Wishlist Bulk ✅
```
URL: http://localhost:5000/api/wishlist/bulk
Method: POST
Headers: Authorization Bearer [token]
Body:
{
  "productIds": ["60d5ec49c1234567890abcde", "60d5ec49c1234567890abcdf"]
}

Expected:
{
  "success": true,
  "addedCount": 2,
  "alreadyExistsCount": 0
}
```

---

## Test 2: Wishlist Page Functionality

### Objective: Verify wishlist display and operations work correctly

### Test Steps:

#### 2.1 Navigate to Wishlist
1. Log in with user account
2. Click "My Wishlist" in navbar
3. Should see wishlist page load

**Expected:**
- ✅ No console errors
- ✅ Page renders without loading spinner
- ✅ Message shows "Your wishlist is empty" if no items

#### 2.2 Add Product to Wishlist
1. Go to Shop page
2. Find any product
3. Click heart icon
4. Should see "Added to wishlist" message

**Check in DevTools Console:**
```javascript
// Should see logs like:
"💖 [CONTEXT] Adding to wishlist: [product-id]"
"✅ [CONTEXT] Added to wishlist successfully"
```

#### 2.3 Wishlist Item Display
1. Navigate to Wishlist page
2. Product card should show:
   - ✅ Product image
   - ✅ Product name (clickable)
   - ✅ Price or discount price
   - ✅ Discount badge (if applicable)
   - ✅ Stock status
   - ✅ Remove button
   - ✅ "Add to Cart" button

**Test by examining item:**
```javascript
// In console:
const item = document.querySelector('[data-wishlist-item]');
console.log(item?.querySelector('img')?.src);        // Image should load
console.log(item?.querySelector('h3')?.textContent); // Name should show
console.log(item?.querySelector('[data-price]')?.textContent); // Price should show
```

#### 2.4 Remove Product from Wishlist
1. In wishlist, hover over product card
2. Click trash/remove icon
3. Should see "Product removed from wishlist" message
4. Product should disappear from list

**Verify:**
- ✅ Item removed immediately
- ✅ Success message displays
- ✅ Count updates

#### 2.5 Clear Entire Wishlist
1. Add multiple products to wishlist
2. Click "Clear All" button
3. Confirm action
4. All items should disappear

**Expected:**
- ✅ All items removed
- ✅ Success message shown
- ✅ Empty state displayed

---

## Test 3: Admin Product Management

### Objective: Verify admin can create/edit products with correct category

### Test Steps:

#### 3.1 Admin Login
1. Go to admin panel
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. Should redirect to admin products page

**Expected:**
- ✅ Login successful
- ✅ No "Invalid credentials" error
- ✅ Redirected to products page

#### 3.2 View Admin Products Page
1. Check page loads
2. Should show table with products
3. Or show "No products found" message

**Check Console for:**
- ✅ No 401 or 403 errors
- ✅ Products fetched successfully
- ✅ Logs show: `📦 Products data received: X products`

#### 3.3 Create New Product - Category Field

1. Click "Add Product" button
2. Form modal should open

**Verify form fields:**
```
✅ Name field
✅ Category dropdown (populated with categories)
✅ Description field
✅ Price field
✅ Discount Price field
✅ Product Images section
✅ Size & Stock section
✅ Featured checkbox
✅ Active checkbox
```

**Test Category Selection:**
1. Click category dropdown
2. Should show list of categories
3. Select one category
4. Category should be selected (not blank)

**Expected dropdown content:**
```
- Select a category (placeholder)
- Category 1 Name
- Category 2 Name
- Category 3 Name
...
```

#### 3.4 Create Product
1. Fill form:
   ```
   Name: "Test Product"
   Category: "Select any category"
   Description: "Test description"
   Price: 999
   Image URL: "https://images.unsplash.com/photo-..."
   Size S: 10
   Size M: 20
   ...
   ```

2. Click "Create" button
3. Should see success message: "Product created successfully!"

**Verify in Database:**
```javascript
// MongoDB check
db.products.findOne({ name: "Test Product" })

// Should show:
{
  name: "Test Product",
  category: ObjectId("..."),    // ✅ Should be ObjectId, not empty
  slug: "test-product",         // ✅ Auto-generated
  price: 999,
  categoryId: undefined         // ✅ Should NOT exist (transformed to category)
}
```

#### 3.5 Edit Product - Category Preservation
1. Click Edit button on any product
2. Form modal should open
3. All fields should be pre-populated
4. **Category dropdown should show selected category**

**Critical Check:**
```
BEFORE FIX: Category dropdown would be empty after loading ❌
AFTER FIX: Category dropdown shows the product's current category ✅
```

1. Change product name to: "Updated Test Product"
2. Keep category selected
3. Click "Update"
4. Should see: "Product updated successfully!"

**Verify:**
- ✅ Category still assigned in database
- ✅ Name updated
- ✅ All other fields preserved

#### 3.6 Delete Product
1. Click trash icon on any product
2. Confirm deletion
3. Should see: "Product deleted successfully!"
4. Product removed from table

**Expected:**
- ✅ Product deactivated (soft delete)
- ✅ No longer appears in admin list
- ✅ Not visible to customers

---

## Test 4: Integration Tests

### 4.1 Add Product via Admin → View in Shop

1. Create product in admin:
   ```
   Name: "Integration Test Product"
   Category: "Any active category"
   Price: 499
   Image: Valid URL
   Stock: 50
   ```

2. Go to Shop page
3. Navigate to the product's category
4. **Product should appear in shop** ✅

5. Click product to view details
6. **All details should display correctly** ✅

7. Add to wishlist from product page
8. Go to wishlist
9. **Product should appear with all details** ✅

### 4.2 Category Filtering

1. In admin, create product with specific category
2. Go to shop
3. Filter by that category
4. **Only products from that category appear** ✅

5. Remove product in admin
6. Refresh shop
7. **Product disappears from shop** ✅

### 4.3 Complete Wishlist Flow

1. **Add multiple products:**
   - Add 3 different products to wishlist
   - Check count (should be 3)

2. **Remove one product:**
   - Remove 1 product
   - Count should update to 2

3. **Add to cart:**
   - Click "Add to Cart" on wishlist item
   - Product should appear in cart
   - Item can remain in or be removed from wishlist

4. **Clear wishlist:**
   - Click "Clear All"
   - All items removed
   - Count resets to 0

---

## Console Log Verification

### Expected Logs During Testing:

#### Creating Product (Admin):
```
💾 Saving product to: http://localhost:5000/api/admin/products
💾 Payload: { name: "...", categoryId: "...", ... }
✅ Product saved successfully
```

#### Fetching Wishlist:
```
💖 [CONTEXT] Refreshing wishlist...
💖 [SERVER] Fetching wishlist for user: [userId]
💖 [CONTEXT] Wishlist refreshed successfully: X items
```

#### Adding to Wishlist:
```
💖 [CONTEXT] Adding to wishlist: [productId]
💖 [SERVER] Adding to wishlist: { userId: "...", productId: "..." }
✅ [CONTEXT] Added to wishlist successfully
```

#### No Errors Should Appear:
```
❌ 404 errors
❌ 401 errors
❌ Cannot read property 'product' of undefined
❌ TypeError: item.product is not defined
❌ Failed to add to wishlist
```

---

## Troubleshooting

### Issue: Wishlist page shows error
**Solution:**
1. Check console for specific error
2. Verify user is logged in
3. Verify backend is running
4. Clear browser storage: `localStorage.clear()`

### Issue: Category dropdown empty in admin
**Solution:**
1. Create at least one category in database
2. Verify categories fetch: `GET /api/categories`
3. Check admin token is valid

### Issue: Product created but category not saved
**Solution:**
1. Check database for product
2. Verify `category` field (not `categoryId`)
3. Check admin route transformation is applied

### Issue: Wishlist items don't display properly
**Solution:**
1. Check console for structure errors
2. Verify `item.product` is defined
3. Check API response has `product` field

---

## Performance Checks

### Wishlist Page Load Time
- Should load in < 2 seconds
- No visible loading spinner if wishlist empty
- Smooth animations

### Admin Product Page Load Time
- Should load in < 3 seconds
- Form should be responsive
- No lag when selecting category

### Database Query Times
```javascript
// In browser console:
console.time('wishlist');
// Make API call
console.timeEnd('wishlist');
// Should be < 500ms
```

---

## Final Verification Checklist

- [ ] All wishlist routes working (count, bulk, check)
- [ ] Wishlist displays products correctly
- [ ] Add to wishlist works
- [ ] Remove from wishlist works
- [ ] Clear wishlist works
- [ ] Admin product creation works
- [ ] Category saves correctly
- [ ] Slug auto-generated
- [ ] Admin product edit works
- [ ] Category pre-populated in edit
- [ ] Admin product delete works
- [ ] No console errors
- [ ] No 404 or 401 errors
- [ ] Database shows correct structure

---

## Success Indicators 🎉

When all tests pass, you should see:
```
✅ Wishlist fully functional
✅ Products display with all details
✅ Admin can manage products
✅ Categories work correctly
✅ No errors in console
✅ Smooth user experience
```
