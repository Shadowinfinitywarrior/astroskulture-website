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

// Helper to dynamically check Cloudinary credentials and configure it
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
      { folder: process.env.CLOUDINARY_FOLDER || 'custom-designs' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const processImageBuffer = async (file) => {
  const isCloudinaryActive = getCloudinarySetup();
  if (isCloudinaryActive) {
    console.log('☁️ Uploading to Cloudinary...');
    const uploadResult = await uploadToCloudinary(file.buffer);
    return uploadResult.secure_url;
  } else {
    console.warn('⚠️ Cloudinary not configured. Storing base64 Data URL fallback.');
    const base64Image = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64Image}`;
  }
};

const userDesignUpload = upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

// 1. Submit a custom design request (User) - Supports Front View and Back View
router.post('/', auth, userDesignUpload, async (req, res) => {
  try {
    const { color, size, neckStyle, sleeveStyle, otherDetails, whatsappNumber } = req.body;

    const frontFile = req.files?.['frontImage']?.[0] || req.files?.['image']?.[0] || req.file;
    const backFile = req.files?.['backImage']?.[0];

    if (!frontFile && !backFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one design image (Front View or Back View in JPG/PNG)'
      });
    }

    if (!color || !size || !neckStyle || !sleeveStyle || !whatsappNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required specifications: color, size, neckStyle, sleeveStyle, and WhatsApp number'
      });
    }

    let frontImageUrl = '';
    let backImageUrl = '';

    if (frontFile) {
      frontImageUrl = await processImageBuffer(frontFile);
    }
    if (backFile) {
      backImageUrl = await processImageBuffer(backFile);
    }

    const primaryImageUrl = frontImageUrl || backImageUrl;

    const newDesign = new CustomDesign({
      userId: req.user._id,
      frontImageUrl,
      backImageUrl,
      imageUrl: primaryImageUrl,
      color,
      size,
      neckStyle,
      sleeveStyle,
      whatsappNumber,
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

// 5. Delete a custom design request (User)
router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await CustomDesign.findOne({ _id: req.params.id, userId: req.user._id });

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Custom design request not found or unauthorized'
      });
    }

    await CustomDesign.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Custom design request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom design request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom design request',
      error: error.message
    });
  }
});

// 6. Delete any custom design request (Admin)
router.delete('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const design = await CustomDesign.findById(req.params.id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Custom design request not found'
      });
    }

    await CustomDesign.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Custom design request deleted successfully by Admin'
    });
  } catch (error) {
    console.error('Error deleting custom design request (Admin):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete custom design request',
      error: error.message
    });
  }
});

const adminCompletedUpload = upload.fields([
  { name: 'completedFrontImage', maxCount: 1 },
  { name: 'completedBackImage', maxCount: 1 },
  { name: 'completedImage', maxCount: 1 }
]);

// 7. Upload completed design images (Front View and/or Back View by Admin)
router.put('/admin/:id/completed', authenticateAdmin, adminCompletedUpload, async (req, res) => {
  try {
    const frontFile = req.files?.['completedFrontImage']?.[0] || req.files?.['completedImage']?.[0] || req.file;
    const backFile = req.files?.['completedBackImage']?.[0];

    if (!frontFile && !backFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one completed design image file (Front View or Back View)'
      });
    }

    const design = await CustomDesign.findById(req.params.id);
    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Custom design request not found'
      });
    }

    if (frontFile) {
      const frontUrl = await processImageBuffer(frontFile);
      design.completedFrontDesignUrl = frontUrl;
      design.completedDesignUrl = frontUrl;
    }

    if (backFile) {
      const backUrl = await processImageBuffer(backFile);
      design.completedBackDesignUrl = backUrl;
      if (!design.completedDesignUrl) {
        design.completedDesignUrl = backUrl;
      }
    }

    // Automatically accept the request if it was pending
    if (design.status === 'pending') {
      design.status = 'accepted';
      if (!design.adminNotes) {
        design.adminNotes = 'Completed design uploaded by admin.';
      }
    }
    design.updatedAt = Date.now();

    await design.save();

    res.json({
      success: true,
      message: 'Completed design(s) uploaded successfully',
      data: design
    });
  } catch (error) {
    console.error('Error uploading completed design (Admin):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload completed design',
      error: error.message
    });
  }
});

export default router;
