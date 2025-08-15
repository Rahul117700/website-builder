const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const { io, userSockets } = require('../../../server');

const prisma = new PrismaClient();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
 * @route   GET /api/sites
 * @desc    Get all sites for a user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/sites/:id
 * @desc    Get a site by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const site = await prisma.site.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        pages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Check if user owns the site
    if (site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    res.json(site);
  } catch (error) {
    console.error('Error fetching site:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/sites
 * @desc    Create a new site
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, template, subdomain } = req.body;

    // Validate input
    if (!name || !template || !subdomain) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Check if subdomain is available
    const existingSite = await prisma.site.findUnique({
      where: {
        subdomain: subdomain.toLowerCase()
      }
    });

    if (existingSite) {
      return res.status(400).json({ error: 'Subdomain is already taken' });
    }

    // Create site
    const site = await prisma.site.create({
      data: {
        name,
        description,
        template,
        subdomain: subdomain.toLowerCase(),
        primaryColor: template === 'pharma' ? '#4f46e5' : 
                     template === 'restaurant' ? '#ef4444' : '#3b82f6',
        secondaryColor: template === 'pharma' ? '#818cf8' : 
                       template === 'restaurant' ? '#f87171' : '#93c5fd',
        user: {
          connect: {
            id: req.user.id
          }
        }
      }
    });

    // Create default home page
    let homePageContent = '';
    
    if (template === 'pharma') {
      homePageContent = `
        <h1>Welcome to ${name}</h1>
        <p>Your trusted pharmacy partner for all your healthcare needs.</p>
        <h2>Our Services</h2>
        <ul>
          <li>Prescription Medications</li>
          <li>Over-the-Counter Products</li>
          <li>Health Consultations</li>
          <li>Preventive Care</li>
        </ul>
        <h2>Contact Us</h2>
        <p>Phone: (123) 456-7890</p>
        <p>Email: <a href="${BASE_URL}/s/${subdomain.toLowerCase()}">Open your site</a></p>
      `;
    } else if (template === 'restaurant') {
      homePageContent = `
        <h1>Welcome to ${name}</h1>
        <p>Delicious food in a wonderful atmosphere.</p>
        <h2>Our Menu</h2>
        <p>We offer a variety of dishes made with fresh, local ingredients.</p>
        <h2>Make a Reservation</h2>
        <p>Book your table online or call us at (123) 456-7890.</p>
        <h2>Opening Hours</h2>
        <p>Monday - Friday: 11:00 AM - 10:00 PM</p>
        <p>Saturday - Sunday: 10:00 AM - 11:00 PM</p>
      `;
    } else {
      homePageContent = `
        <h1>Welcome to ${name}</h1>
        <p>This is your new website. Edit this content to make it your own.</p>
        <h2>About Us</h2>
        <p>Add information about your business or organization here.</p>
        <h2>Contact Us</h2>
        <p>Phone: (123) 456-7890</p>
        <p>Email: <a href="${BASE_URL}/s/${subdomain.toLowerCase()}">Open your site</a></p>
      `;
    }

    await prisma.page.create({
      data: {
        title: 'Home',
        slug: 'home',
        content: homePageContent,
        isHome: true,
        published: true,
        site: {
          connect: {
            id: site.id
          }
        }
      }
    });

    // Create about page
    let aboutPageContent = '';
    
    if (template === 'pharma') {
      aboutPageContent = `
        <h1>About ${name}</h1>
        <p>We are a dedicated pharmacy committed to providing quality healthcare products and services to our community.</p>
        <h2>Our Mission</h2>
        <p>To improve the health and wellbeing of our customers by providing accessible, reliable, and personalized pharmacy services.</p>
        <h2>Our Team</h2>
        <p>Our team of licensed pharmacists and healthcare professionals are here to assist you with all your medication and health-related needs.</p>
      `;
    } else if (template === 'restaurant') {
      aboutPageContent = `
        <h1>About ${name}</h1>
        <p>We are a family-owned restaurant serving delicious meals since 2010.</p>
        <h2>Our Story</h2>
        <p>Founded by Chef John Doe, ${name} has been delighting customers with authentic cuisine and warm hospitality.</p>
        <h2>Our Ingredients</h2>
        <p>We source the freshest ingredients from local farmers and suppliers to ensure the highest quality in every dish we serve.</p>
      `;
    } else {
      aboutPageContent = `
        <h1>About Us</h1>
        <p>Add information about your business, organization, or yourself here.</p>
        <h2>Our Story</h2>
        <p>Share your journey, mission, and values with your visitors.</p>
        <h2>Our Team</h2>
        <p>Introduce the people behind your organization.</p>
      `;
    }

    await prisma.page.create({
      data: {
        title: 'About',
        slug: 'about',
        content: aboutPageContent,
        published: true,
        site: {
          connect: {
            id: site.id
          }
        }
      }
    });

    // Create contact page
    await prisma.page.create({
      data: {
        title: 'Contact',
        slug: 'contact',
        content: `
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with us using the information below.</p>
          <h2>Contact Information</h2>
          <p>Email: <a href="${BASE_URL}/s/${subdomain.toLowerCase()}">Open your site</a></p>
          <p>Phone: (123) 456-7890</p>
          <p>Address: 123 Main Street, City, Country</p>
          <p>Site URL: <a href="${BASE_URL}/s/${subdomain.toLowerCase()}">${BASE_URL}/s/${subdomain.toLowerCase()}</a></p>
        `,
        published: true,
        site: {
          connect: {
            id: site.id
          }
        }
      }
    });

    res.status(201).json(site);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/sites/:id
 * @desc    Update a site
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, customDomain, primaryColor, secondaryColor, googleAnalytics, template } = req.body;

    // Check if site exists and user owns it
    const existingSite = await prisma.site.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!existingSite) {
      return res.status(404).json({ error: 'Site not found' });
    }

    if (existingSite.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Check if custom domain is already in use
    if (customDomain && customDomain !== existingSite.customDomain) {
      const domainExists = await prisma.site.findUnique({
        where: {
          customDomain
        }
      });

      if (domainExists) {
        return res.status(400).json({ error: 'Custom domain is already in use' });
      }
    }

    // Update site
    const updatedSite = await prisma.site.update({
      where: {
        id: req.params.id
      },
      data: {
        name: name || existingSite.name,
        description: description !== undefined ? description : existingSite.description,
        customDomain: customDomain !== undefined ? customDomain : existingSite.customDomain,
        primaryColor: primaryColor || existingSite.primaryColor,
        secondaryColor: secondaryColor || existingSite.secondaryColor,
        googleAnalytics: googleAnalytics !== undefined ? googleAnalytics : existingSite.googleAnalytics,
        ...(template !== undefined && { template }),
      }
    });

    // Real-time notifications
    if (template && template !== existingSite.template) {
      const notification = await prisma.notification.create({
        data: {
          userId: existingSite.userId,
          type: 'template',
          message: `Template changed to "${template}" for site "${updatedSite.name}"`,
        }
      });
      const socketId = userSockets.get(existingSite.userId);
      if (socketId) io.to(socketId).emit('notification', notification);
    }
    if (customDomain && customDomain !== existingSite.customDomain) {
      const notification = await prisma.notification.create({
        data: {
          userId: existingSite.userId,
          type: 'domain',
          message: `Custom domain "${customDomain}" connected to site "${updatedSite.name}"`,
        }
      });
      const socketId = userSockets.get(existingSite.userId);
      if (socketId) io.to(socketId).emit('notification', notification);
    }

    res.json(updatedSite);
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/sites/:id
 * @desc    Delete a site
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if site exists and user owns it
    const site = await prisma.site.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    if (site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Delete site (will cascade delete pages, bookings, analytics)
    await prisma.site.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/sites/check-subdomain/:subdomain
 * @desc    Check if a subdomain is available
 * @access  Public
 */
router.get('/check-subdomain/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    // Check if subdomain is available
    const existingSite = await prisma.site.findUnique({
      where: {
        subdomain: subdomain.toLowerCase()
      }
    });

    res.json({ available: !existingSite });
  } catch (error) {
    console.error('Error checking subdomain:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
