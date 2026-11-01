import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Settings from '../models/Settings.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { invalidateHomepageCache } from './homepage.js';

const router = express.Router();

// Multer memory storage for hero image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) are allowed!'), false);
    }
  }
});

// Configure Cloudinary helper
const getCloudinarySetup = () => {
  const hasCloudinaryCreds = process.env.CLOUDINARY_CLOUD_NAME && 
                            process.env.CLOUDINARY_API_KEY && 
                            process.env.CLOUDINARY_API_SECRET;
  if (hasCloudinaryCreds) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    return true;
  }
  return false;
};

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || 'hero-banners' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// POST /api/settings/upload-hero - Upload hero image directly to Cloudinary
router.post('/upload-hero', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    if (!getCloudinarySetup()) {
      return res.status(500).json({
        success: false,
        message: 'Image upload service is not configured'
      });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer);

    res.json({
      success: true,
      message: 'Hero image uploaded successfully',
      url: uploadResult.secure_url
    });
  } catch (error) {
    console.error('❌ Error uploading hero image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload hero image: ' + error.message
    });
  }
});

// GET settings - Publicly accessible so visitors and storefront see correct banners and shipping rules
router.get('/', async (req, res) => {
  try {
    // Find ALL settings documents
    let allSettings = await Settings.find().sort({ updatedAt: -1 });

    let settings;

    if (allSettings.length === 0) {
      // No settings exist, create default
      console.log('⚙️ No settings found, creating defaults');
      settings = await Settings.create({});
    } else {
      // Use the most recent one
      settings = allSettings[0];

      // If there are duplicates (more than 1), delete older ones
      if (allSettings.length > 1) {
        console.warn(`⚠️ Found ${allSettings.length} settings documents. Cleaning up ${allSettings.length - 1} duplicates.`);
        const idsToDelete = allSettings.slice(1).map(s => s._id);
        await Settings.deleteMany({ _id: { $in: idsToDelete } });
        console.log('✅ Duplicates removed');
      }
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { 
      gstPercentage, 
      gstEnabled, 
      shippingFee, 
      shippingEnabled, 
      freeShippingAbove,
      heroSlides,
      heroBannerDesktop,
      heroBannerMobile,
      heroBanner2Desktop,
      heroBanner2Mobile,
      heroBanner3Desktop,
      heroBanner3Mobile,
      heroBanner4Desktop,
      heroBanner4Mobile,
      heroBanner5Desktop,
      heroBanner5Mobile,
      announcementText
    } = req.body;

    // Find ALL settings documents
    let allSettings = await Settings.find().sort({ updatedAt: -1 });
    let settings;

    if (allSettings.length === 0) {
      settings = new Settings();
    } else {
      settings = allSettings[0];
      // Cleanup duplicates if any exist during update
      if (allSettings.length > 1) {
        const idsToDelete = allSettings.slice(1).map(s => s._id);
        await Settings.deleteMany({ _id: { $in: idsToDelete } });
      }
    }

    if (gstPercentage !== undefined) settings.gstPercentage = gstPercentage;
    if (gstEnabled !== undefined) settings.gstEnabled = gstEnabled;
    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (shippingEnabled !== undefined) settings.shippingEnabled = shippingEnabled;
    if (freeShippingAbove !== undefined) settings.freeShippingAbove = freeShippingAbove;

    // Cap heroSlides at maximum 5 slides
    if (heroSlides !== undefined) {
      if (Array.isArray(heroSlides)) {
        settings.heroSlides = heroSlides.slice(0, 5);
      } else {
        settings.heroSlides = [];
      }
    }

    if (heroBannerDesktop !== undefined) settings.heroBannerDesktop = heroBannerDesktop;
    if (heroBannerMobile !== undefined) settings.heroBannerMobile = heroBannerMobile;
    if (heroBanner2Desktop !== undefined) settings.heroBanner2Desktop = heroBanner2Desktop;
    if (heroBanner2Mobile !== undefined) settings.heroBanner2Mobile = heroBanner2Mobile;
    if (heroBanner3Desktop !== undefined) settings.heroBanner3Desktop = heroBanner3Desktop;
    if (heroBanner3Mobile !== undefined) settings.heroBanner3Mobile = heroBanner3Mobile;
    if (heroBanner4Desktop !== undefined) settings.heroBanner4Desktop = heroBanner4Desktop;
    if (heroBanner4Mobile !== undefined) settings.heroBanner4Mobile = heroBanner4Mobile;
    if (heroBanner5Desktop !== undefined) settings.heroBanner5Desktop = heroBanner5Desktop;
    if (heroBanner5Mobile !== undefined) settings.heroBanner5Mobile = heroBanner5Mobile;
    if (announcementText !== undefined) settings.announcementText = announcementText;

    settings.updatedAt = new Date();
    await settings.save();

    // Immediately bust homepage cache so changes show up in real-time
    invalidateHomepageCache();

    console.log('✅ Settings updated & homepage cache invalidated');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

export default router;
