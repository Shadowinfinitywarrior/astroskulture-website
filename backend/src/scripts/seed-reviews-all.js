import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/astromain';

const tamilNaduBuyers = [
  { fullName: 'Murugan', email: 'murugan.tn.buyer@astroskulture.in' },
  { fullName: 'Rajesh', email: 'rajesh.tn.buyer@astroskulture.in' },
  { fullName: 'Jegan', email: 'jegan.tn.buyer@astroskulture.in' },
  { fullName: 'Sumitha', email: 'sumitha.tn.buyer@astroskulture.in' },
  { fullName: 'Rajan', email: 'rajan.tn.buyer@astroskulture.in' },
  { fullName: 'Fathima', email: 'fathima.tn.buyer@astroskulture.in' },
  { fullName: 'Saran', email: 'saran.tn.buyer@astroskulture.in' },
  { fullName: 'Karthik', email: 'karthik.tn.buyer@astroskulture.in' },
  { fullName: 'Priya', email: 'priya.tn.buyer@astroskulture.in' },
  { fullName: 'Vignesh', email: 'vignesh.tn.buyer@astroskulture.in' },
  { fullName: 'Divya', email: 'divya.tn.buyer@astroskulture.in' },
  { fullName: 'Aravind', email: 'aravind.tn.buyer@astroskulture.in' },
  { fullName: 'Meenakshi', email: 'meenakshi.tn.buyer@astroskulture.in' },
  { fullName: 'Dinesh', email: 'dinesh.tn.buyer@astroskulture.in' },
  { fullName: 'Kowsalya', email: 'kowsalya.tn.buyer@astroskulture.in' },
  { fullName: 'Gokul', email: 'gokul.tn.buyer@astroskulture.in' },
  { fullName: 'Keerthana', email: 'keerthana.tn.buyer@astroskulture.in' },
  { fullName: 'Anbarasu', email: 'anbarasu.tn.buyer@astroskulture.in' },
  { fullName: 'Muthu', email: 'muthu.tn.buyer@astroskulture.in' },
  { fullName: 'Revathi', email: 'revathi.tn.buyer@astroskulture.in' }
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

  // Clean out older synthetic buyer accounts if any
  await User.deleteMany({ email: { $regex: '@astroskulture\\.in$' } });
  await Review.deleteMany({}); // Reset reviews to populate with Tamil Nadu buyers

  const dummyPassword = await bcrypt.hash('TamilNaduBuyerSecret123!', 8);
  const createdUsers = [];

  for (const buyer of tamilNaduBuyers) {
    const u = await User.create({
      email: buyer.email,
      password: dummyPassword,
      fullName: buyer.fullName,
      role: 'user'
    });
    createdUsers.push(u);
  }

  console.log(`Created ${createdUsers.length} verified Tamil Nadu buyer profiles.`);

  const products = await Product.find({});
  console.log(`Found ${products.length} products to seed reviews for.`);

  let totalReviewsAdded = 0;

  for (const product of products) {
    // Pick 3 to 4 distinct Tamil Nadu users for each product
    const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random());
    const countToSeed = Math.floor(Math.random() * 2) + 3; // 3 or 4 reviews
    const selectedUsers = shuffledUsers.slice(0, countToSeed);

    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsers[i];
      const template = reviewPool[(i + Math.floor(Math.random() * reviewPool.length)) % reviewPool.length];
      const daysAgo = Math.floor(Math.random() * 25) + 1;
      const reviewDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await Review.create({
        productId: product._id,
        userId: user._id,
        rating: template.rating,
        title: template.title,
        comment: template.comment,
        isVerifiedPurchase: true,
        helpfulCount: Math.floor(Math.random() * 7) + 1,
        createdAt: reviewDate,
        updatedAt: reviewDate
      });
      totalReviewsAdded++;
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

  console.log(`✅ Successfully seeded ${totalReviewsAdded} verified Tamil Nadu customer reviews across ${products.length} products.`);
  await mongoose.disconnect();
}

seedReviews().catch(err => {
  console.error('Error seeding reviews:', err);
  process.exit(1);
});
