import express from 'express';
import Settings from '../models/Settings.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

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
      heroBannerDesktop,
      heroBannerMobile,
      heroBanner2Desktop,
      heroBanner2Mobile,
      heroBanner3Desktop,
      heroBanner3Mobile,
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
    if (heroBannerDesktop !== undefined) settings.heroBannerDesktop = heroBannerDesktop;
    if (heroBannerMobile !== undefined) settings.heroBannerMobile = heroBannerMobile;
    if (heroBanner2Desktop !== undefined) settings.heroBanner2Desktop = heroBanner2Desktop;
    if (heroBanner2Mobile !== undefined) settings.heroBanner2Mobile = heroBanner2Mobile;
    if (heroBanner3Desktop !== undefined) settings.heroBanner3Desktop = heroBanner3Desktop;
    if (heroBanner3Mobile !== undefined) settings.heroBanner3Mobile = heroBanner3Mobile;
    if (announcementText !== undefined) settings.announcementText = announcementText;

    settings.updatedAt = new Date();
    await settings.save();

    console.log('✅ Settings updated:', settings);

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
