import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  desktopImage: {
    type: String,
    default: ''
  },
  mobileImage: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'Shop Now'
  },
  buttonLink: {
    type: String,
    default: 'shop'
  }
}, { _id: true });

const settingsSchema = new mongoose.Schema({
  gstPercentage: {
    type: Number,
    default: 18,
    min: 0,
    max: 100
  },
  gstEnabled: {
    type: Boolean,
    default: true
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingEnabled: {
    type: Boolean,
    default: true
  },
  freeShippingAbove: {
    type: Number,
    default: 999,
    min: 0
  },
  // Dynamic Hero Slides array (up to 5 maximum controlled by Admin)
  heroSlides: {
    type: [heroSlideSchema],
    default: []
  },
  // Legacy individual fields supported for backward compatibility (up to 5)
  heroBannerDesktop: {
    type: String,
    default: ''
  },
  heroBannerMobile: {
    type: String,
    default: ''
  },
  heroBanner2Desktop: {
    type: String,
    default: ''
  },
  heroBanner2Mobile: {
    type: String,
    default: ''
  },
  heroBanner3Desktop: {
    type: String,
    default: ''
  },
  heroBanner3Mobile: {
    type: String,
    default: ''
  },
  heroBanner4Desktop: {
    type: String,
    default: ''
  },
  heroBanner4Mobile: {
    type: String,
    default: ''
  },
  heroBanner5Desktop: {
    type: String,
    default: ''
  },
  heroBanner5Mobile: {
    type: String,
    default: ''
  },
  announcementText: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
