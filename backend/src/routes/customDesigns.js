import express from 'express';
import multer from 'multer';
import { auth, authenticateAdmin } from '../middleware/auth.js';
import CustomDesign from '../models/CustomDesign.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, and PNG files are allowed!'), false);
    }
  }
});

// Configure Cloudinary
const hasCloudinaryCreds = process.env.CLOUDINARY_CLOUD_NAME && 
                          process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryCreds) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'custom-designs' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// 1. Submit a custom design request (User)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { color, size, neckStyle, sleeveStyle, otherDetails } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (JPG/PNG)'
      });
    }

    if (!color || !size || !neckStyle || !sleeveStyle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required specifications: color, size, neckStyle, sleeveStyle'
      });
    }

    let imageUrl;
    if (hasCloudinaryCreds) {
      console.log('☁️ Uploading to Cloudinary...');
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
      console.log('✅ Cloudinary URL generated:', imageUrl);
    } else {
      console.warn('⚠️ Cloudinary not configured. Storing base64 Data URL fallback.');
      const base64Image = req.file.buffer.toString('base64');
      imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    const newDesign = new CustomDesign({
      userId: req.user._id,
      imageUrl,
      color,
      size,
      neckStyle,
      sleeveStyle,
      otherDetails: otherDetails || '',
      status: 'pending'
    });

    await newDesign.save();

    res.status(201).json({
      success: true,
      message: 'Custom design request submitted successfully',
      data: newDesign
    });
  } catch (error) {
    console.error('Error submitting custom design request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit custom design request',
      error: error.message
    });
  }
});

// 2. Get user's custom design requests (User)
router.get('/my', auth, async (req, res) => {
  try {
    const designs = await CustomDesign.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: designs
    });
  } catch (error) {
    console.error('Error fetching user custom designs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom designs',
      error: error.message
    });
  }
});

// 3. Get all custom designs (Admin)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const designs = await CustomDesign.find()
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: designs
    });
  } catch (error) {
    console.error('Error fetching all custom designs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch custom designs',
      error: error.message
    });
  }
});

// 4. Accept/Reject custom design request with notes (Admin)
router.put('/admin/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted or rejected.'
      });
    }

    const design = await CustomDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Custom design request not found'
      });
    }

    design.status = status;
    design.adminNotes = notes || '';
    design.updatedAt = Date.now();

    await design.save();

    res.json({
      success: true,
      message: `Custom design request successfully ${status}`,
      data: design
    });
  } catch (error) {
    console.error('Error updating custom design status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update custom design status',
      error: error.message
    });
  }
});

export default router;
