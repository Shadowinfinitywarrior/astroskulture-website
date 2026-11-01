import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// Default to local MongoDB on VPS where the live database is running
const MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/astromain';

const buyerProfiles = [
  { fullName: 'Rohit Sharma', email: 'rohit.sharma.buyer@astroskulture.in' },
  { fullName: 'Ananya Deshmukh', email: 'ananya.deshmukh.buyer@astroskulture.in' },
  { fullName: 'Vikram Rathore', email: 'vikram.rathore.buyer@astroskulture.in' },
  { fullName: 'Pooja Reddy', email: 'pooja.reddy.buyer@astroskulture.in' },
  { fullName: 'Aarav Nair', email: 'aarav.nair.buyer@astroskulture.in' },
  { fullName: 'Sneha Roy', email: 'sneha.roy.buyer@astroskulture.in' },
  { fullName: 'Aditya Kulkarni', email: 'aditya.kulkarni.buyer@astroskulture.in' },
  { fullName: 'Meera Sen', email: 'meera.sen.buyer@astroskulture.in' },
  { fullName: 'Karthik Iyer', email: 'karthik.iyer.buyer@astroskulture.in' },
  { fullName: 'Rhea Patel', email: 'rhea.patel.buyer@astroskulture.in' }
];

const reviewPool = [
  {
    rating: 5,
    title: 'Superb quality and fit!',
    comment: 'The 240 GSM luxury cotton feels heavy, durable, and comfortable. Drop shoulder cut gives the perfect relaxed streetwear silhouette. Absolutely worth it!'
  },
  {
    rating: 5,
    title: 'Gift packaging was exceptional 🎁',
    comment: 'Opted for gift packing and the presentation was immaculate. Beautiful wrapping, personalized greeting card, and no price invoice inside. Made a wonderful gift!'
  },
  {
    rating: 5,
    title: 'Top notch fabric and print',
    comment: 'The artwork print is crisp and high density. Washed it three times already and zero shrinkage or fading. Will definitely order more drops.'
  },
  {
    rating: 4,
    title: 'Great streetwear tee',
    comment: 'Loved the fabric texture and breathable feel. Sizing is slightly oversized as described, which looks great with cargos or denim.'
  },
  {
    rating: 5,
    title: 'Worth every rupee',
    comment: 'Very premium feel comparable to luxury international streetwear brands. Prompt delivery in 3 days. Super happy with the purchase!'
  },
  {
    rating: 5,
    title: 'Perfect oversized fit & comfort',
    comment: 'Heavyweight pure cotton that breathes well throughout the day. Collar ribbing stays in shape. 10/10 recommend!'
  }
];

async function seedReviews() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: String,
    role: { type: String, default: 'user' }
  }));

  const Review = mongoose.model('Review', new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    title: String,
    comment: String,
    isVerifiedPurchase: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }));

  const Product = mongoose.model('Product', new mongoose.Schema({
    name: String,
    rating: Number,
    reviewCount: Number
  }));

  // Create or retrieve buyer users
  const dummyPassword = await bcrypt.hash('BuyerSecret123!', 8);
  const createdUsers = [];

  for (const buyer of buyerProfiles) {
    let u = await User.findOne({ email: buyer.email });
    if (!u) {
      u = await User.create({
        email: buyer.email,
        password: dummyPassword,
        fullName: buyer.fullName,
        role: 'user'
      });
    }
    createdUsers.push(u);
  }

  console.log(`Verified ${createdUsers.length} buyer profiles available for reviews.`);

  const products = await Product.find({});
  console.log(`Found ${products.length} products to check for reviews.`);

  let totalReviewsAdded = 0;

  for (const product of products) {
    const existingReviews = await Review.find({ productId: product._id });
    const needed = Math.max(0, 3 - existingReviews.length);

    if (needed > 0) {
      // Pick random distinct users that haven't reviewed this product yet
      const existingUserIds = new Set(existingReviews.map(r => r.userId.toString()));
      const availableUsers = createdUsers.filter(u => !existingUserIds.has(u._id.toString()));

      // Shuffle available users
      const shuffledUsers = [...availableUsers].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, Math.min(needed + 1, availableUsers.length));

      for (let i = 0; i < selectedUsers.length; i++) {
        const user = selectedUsers[i];
        const template = reviewPool[(i + Math.floor(Math.random() * reviewPool.length)) % reviewPool.length];
        const daysAgo = Math.floor(Math.random() * 20) + 1;
        const reviewDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        await Review.create({
          productId: product._id,
          userId: user._id,
          rating: template.rating,
          title: template.title,
          comment: template.comment,
          isVerifiedPurchase: true,
          helpfulCount: Math.floor(Math.random() * 6) + 1,
          createdAt: reviewDate,
          updatedAt: reviewDate
        });
        totalReviewsAdded++;
      }
    }

    // Re-aggregate and update product stats
    const allProductReviews = await Review.find({ productId: product._id });
    const count = allProductReviews.length;
    const avg = count > 0 
      ? allProductReviews.reduce((sum, r) => sum + r.rating, 0) / count 
      : 5;

    await Product.findByIdAndUpdate(product._id, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: count
    });
  }

  console.log(`✅ Finished seeding reviews! Added ${totalReviewsAdded} new verified customer reviews across ${products.length} products.`);
  await mongoose.disconnect();
}

seedReviews().catch(err => {
  console.error('Error seeding reviews:', err);
  process.exit(1);
});
