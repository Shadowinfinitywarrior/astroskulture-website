import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import Blog from '../models/Blog.js';

const router = express.Router();

// Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

// Get blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
      .lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: error.message
    });
  }
});

// Admin routes - Create blog
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, imageUrl, isPublished, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    let slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const baseSlug = slug;
    let count = 0;

    while (true) {
      try {
        const blog = new Blog({
          title,
          slug,
          content,
          excerpt: excerpt || content.substring(0, 160),
          imageUrl,
          author: req.user._id,
          isPublished: isPublished || false,
          publishedAt: isPublished ? Date.now() : null,
          tags: tags || []
        });

        await blog.save();

        return res.status(201).json({
          success: true,
          data: blog
        });
      } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
          count++;
          slug = `${baseSlug}-${count}`;
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating blog',
      error: error.message
    });
  }
});

// Admin routes - Update blog
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { isPublished } = req.body;
    const updateData = { ...req.body, updatedAt: Date.now() };

    // Set publishedAt when publishing
    if (isPublished && !updateData.publishedAt) {
      updateData.publishedAt = Date.now();
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
});

// Admin routes - Delete blog
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: error.message
    });
  }
});

// Admin routes - Get all blogs (including unpublished)
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: error.message
    });
  }
});

export default router;