# 📋 Admin Quick Guide - ASTRO-MAIN

## 🔑 Admin Panel Access

### Login
1. Go to `/admin` in your browser
2. Enter admin email and password
3. Click "Login"

### Dashboard
- View key metrics
- Quick access to all management features
- Recent activity overview

---

## 📚 Blog Management

### Create Blog Post
1. Click **"Blog Management"** in admin menu
2. Click **"Create Blog"** button
3. Fill in the form:
   - **Title**: Blog post title (auto-generates slug)
   - **Image URL**: Direct image link (with live preview)
   - **Excerpt**: Short summary (shows in blog list)
   - **Content**: Full blog content (supports HTML)
   - **Tags**: Comma-separated tags (e.g., "astrology, zodiac, horoscope")
   - **Publish**: Toggle to publish/draft status

4. Click **"Create"** button
5. Success message appears

### Edit Blog Post
1. In Blog Management, find the blog in the table
2. Click the **"Edit"** (pencil) icon
3. Modify the content as needed
4. Click **"Update"** button

### Delete Blog Post
1. In Blog Management, find the blog in the table
2. Click the **"Delete"** (trash) icon
3. Confirm deletion in the popup
4. Blog is removed

### Tips
- Published blogs appear on `/blog` page
- Draft blogs (unpublished) only show in admin
- Images must be publicly accessible URLs
- Tags help users find related content

**Example Content Format**:
```
<h2>Blog Heading</h2>
<p>Your blog paragraph text here.</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
```

---

## 🏷️ Category Management

### Create Category
1. Click **"Categories"** in admin menu
2. Click **"Add Category"** button
3. Fill in:
   - **Category Name**: (e.g., "Mystic Apparel")
   - **Slug**: Auto-generated from name (can edit)
   - **Image URL**: Category display image
   - **Description**: What is this category about

4. Click **"Add"** button

### Edit Category
1. Find category in the table
2. Click **"Edit"** (pencil) icon
3. Update details
4. Click **"Update"** button

### Delete Category
1. Find category in the table
2. Click **"Delete"** (trash) icon
3. Confirm deletion

### Benefits
- Categories appear on homepage carousel
- Customers can filter products by category
- Creates organized shopping experience

**Popular Categories**:
- T-Shirts
- Accessories
- Horoscope Guides
- Crystal Sets
- Zodiac Merchandise

---

## 🎯 Banner Management

### Create Promotional Banner
1. Click **"Banners"** in admin menu
2. Click **"Create Banner"** button
3. Configure:
   - **Discount Percentage**: 1-100% (e.g., 25 for 25% off)
   - **Background Color**: Click color picker
   - **Text Color**: Click color picker
   - **Display Order**: Priority (lower = shows first)
   - **Active**: Toggle to enable/disable

4. Click **"Save"** button

### Tips for Banners
- **Contrast**: Ensure text is readable on background
- **Examples**:
  - Red background (#dc2626) + White text (#ffffff) = Classic
  - Dark blue background + Yellow text = High visibility
  - Black background + Gold text = Premium look

### Best Practices
- Discount percentage: 20-50% (realistic & attractive)
- 2-3 banners at a time (not too cluttered)
- Update seasonally (holidays, sales events)
- Active/Inactive toggle for quick changes

### Where Banners Display
- **Homepage**: Top section with animated text
- **Scrolling effect**: Text moves smoothly across banner
- **Only active banners** show to customers
- **Sorted by display order** (1st banner shows first)

---

## 🛍️ Product Management

### Create Product
1. Click **"Products"** in admin menu
2. Click **"Add Product"** button
3. Fill in:
   - **Name**: Product title
   - **Category**: Select from dropdown
   - **Price**: Original price
   - **Discount Price**: Optional (shows "On Sale")
   - **Images**: Add image URLs
   - **Description**: Full product details
   - **Sizes**: Add available sizes with stock
   - **Featured**: Toggle to highlight on homepage

4. Click **"Create"** button

### Featured Products
- Display on homepage
- Great for seasonal items
- Use for promotions

---

## 👥 User Management

### View Users
1. Click **"Users"** in admin menu
2. See all registered users
3. View email, registration date, status

### Manage Users
- View user orders
- Check user information
- Delete if needed

---

## 📦 Order Management

### View Orders
1. Click **"Orders"** in admin menu
2. See all customer orders
3. Details include:
   - Order ID
   - Customer name
   - Order date
   - Total amount
   - Status

### Update Order Status
1. Click on order
2. Change status:
   - **Pending**: Just received
   - **Processing**: Being prepared
   - **Shipped**: On the way
   - **Delivered**: Received by customer
   - **Cancelled**: Order cancelled

3. Save changes

---

## 📊 Dashboard

### Key Metrics
- Total products
- Total orders
- Active banners
- Blog posts published
- User count

### Quick Actions
- Create new blog
- Create new banner
- Add product
- View recent orders

---

## 🎨 Best Practices

### For Blogs
- ✅ Clear, engaging titles
- ✅ High-quality images (JPG/PNG)
- ✅ Relevant tags (3-5 tags)
- ✅ Publish during peak traffic times
- ✅ Regularly update content

### For Banners
- ✅ Simple, readable text
- ✅ Good color contrast
- ✅ 15-30% discount (realistic)
- ✅ Rotate regularly
- ✅ Enable/disable for events

### For Categories
- ✅ Clear, concise names
- ✅ Category-specific images
- ✅ Logical organization
- ✅ Meaningful descriptions
- ✅ Limit to 10-15 main categories

### For Products
- ✅ Accurate pricing
- ✅ Multiple product images
- ✅ Detailed descriptions
- ✅ Correct size/stock info
- ✅ Professional product photos

---

## 🔒 Security Tips

### Account Security
- ✅ Use strong password (mix of letters, numbers, symbols)
- ✅ Never share admin login
- ✅ Log out after each session
- ✅ Use secure browser
- ✅ Enable 2FA if available

### Data Protection
- ✅ Regular backups
- ✅ Don't modify database directly
- ✅ Keep sensitive info confidential
- ✅ Review orders for fraud
- ✅ Verify payment information

---

## 📞 Troubleshooting

### Blog Creation Failed
- [ ] Check internet connection
- [ ] Verify image URL is valid
- [ ] Try refreshing page
- [ ] Check browser console for errors

### Banners Not Showing
- [ ] Ensure banner is marked "Active"
- [ ] Check display order
- [ ] Refresh homepage
- [ ] Clear browser cache

### Images Not Loading
- [ ] Verify URL is complete (starts with http/https)
- [ ] Check image still exists
- [ ] Try different image format
- [ ] Check file size

---

## 📈 Analytics & Performance

### Monitor Blog Performance
- View count tracking
- Popular blog tags
- Reader engagement

### Product Insights
- Top-selling products
- Low-stock alerts
- Category performance

### Customer Data
- User registration trends
- Order frequency
- Average order value

---

## 🚀 Tips for Success

### Daily Tasks
1. Check new orders
2. Update order statuses
3. Monitor customer feedback
4. Stock inventory check

### Weekly Tasks
1. Publish new blog post
2. Review sales metrics
3. Update promotions
4. Check user feedback

### Monthly Tasks
1. Analyze performance
2. Plan new campaigns
3. Update products
4. Seasonal adjustments

---

## ❓ FAQ

**Q: How do I unpublish a blog?**
A: Edit the blog and uncheck the "Publish" checkbox, then click "Update".

**Q: Can I schedule blogs?**
A: Currently no, but you can create as draft and publish when ready.

**Q: How many banners can I have?**
A: Unlimited, but 2-3 active is recommended to avoid clutter.

**Q: What image formats work?**
A: JPG, PNG, WebP - use image URLs, not uploads.

**Q: Can customers edit categories?**
A: No, only admins can manage categories.

**Q: How do I delete a user account?**
A: Go to Users, select user, click Delete.

**Q: What's the password recovery process?**
A: Contact system administrator for password reset.

**Q: Can I undo changes?**
A: No, changes are permanent. Be careful when editing/deleting.

---

## 📞 Support

If you need help:
1. Check this guide first
2. Review error messages
3. Try refreshing the page
4. Clear browser cache
5. Contact technical support

---

## 🎉 You're Ready!

You now have all the knowledge to:
- ✅ Create engaging blog content
- ✅ Manage product categories
- ✅ Run promotional campaigns
- ✅ Organize orders
- ✅ Monitor user activity
- ✅ Keep inventory updated

**Start managing your ASTRO-MAIN store like a pro!**