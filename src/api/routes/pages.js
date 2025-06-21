const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');

const prisma = new PrismaClient();

// Middleware to authenticate user
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    
    // Add user to request
    req.user = { id: decoded.id };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

/**
 * @route   GET /api/pages
 * @desc    Get all pages for a site
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { siteId } = req.query;

    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }

    // Check if user owns the site
    const site = await prisma.site.findUnique({
      where: {
        id: siteId
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    if (site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Get pages for the site
    const pages = await prisma.page.findMany({
      where: {
        siteId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/pages/:id
 * @desc    Get a page by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        site: true
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Check if user owns the site
    if (page.site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/pages
 * @desc    Create a new page
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, siteId, isHome, published } = req.body;

    // Validate input
    if (!title || !siteId) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if user owns the site
    const site = await prisma.site.findUnique({
      where: {
        id: siteId
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    if (site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug already exists for this site
    const existingPage = await prisma.page.findFirst({
      where: {
        siteId,
        slug
      }
    });

    if (existingPage) {
      return res.status(400).json({ error: 'A page with this title already exists' });
    }

    // If this is set as home page, update any existing home page
    if (isHome) {
      await prisma.page.updateMany({
        where: {
          siteId,
          isHome: true
        },
        data: {
          isHome: false
        }
      });
    }

    // Create page
    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content: content || '',
        isHome: isHome || false,
        published: published || false,
        site: {
          connect: {
            id: siteId
          }
        }
      }
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/pages/:id
 * @desc    Update a page
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, isHome, published } = req.body;

    // Get the page
    const existingPage = await prisma.page.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        site: true
      }
    });

    if (!existingPage) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Check if user owns the site
    if (existingPage.site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Generate new slug if title changed
    let slug = existingPage.slug;
    if (title && title !== existingPage.title) {
      slug = slugify(title, { lower: true, strict: true });
      
      // Check if new slug already exists for this site
      const slugExists = await prisma.page.findFirst({
        where: {
          siteId: existingPage.siteId,
          slug,
          id: {
            not: req.params.id
          }
        }
      });

      if (slugExists) {
        return res.status(400).json({ error: 'A page with this title already exists' });
      }
    }

    // If this is set as home page, update any existing home page
    if (isHome && !existingPage.isHome) {
      await prisma.page.updateMany({
        where: {
          siteId: existingPage.siteId,
          isHome: true
        },
        data: {
          isHome: false
        }
      });
    }

    // Update page
    const updatedPage = await prisma.page.update({
      where: {
        id: req.params.id
      },
      data: {
        title: title || existingPage.title,
        slug,
        content: content !== undefined ? content : existingPage.content,
        isHome: isHome !== undefined ? isHome : existingPage.isHome,
        published: published !== undefined ? published : existingPage.published
      }
    });

    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/pages/:id
 * @desc    Delete a page
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Get the page
    const page = await prisma.page.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        site: true
      }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Check if user owns the site
    if (page.site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Don't allow deleting the home page
    if (page.isHome) {
      return res.status(400).json({ error: 'Cannot delete the home page' });
    }

    // Delete page
    await prisma.page.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
