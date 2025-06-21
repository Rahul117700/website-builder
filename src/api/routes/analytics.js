const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

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
 * @route   GET /api/analytics
 * @desc    Get analytics for a site
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { siteId, period = '30d' } = req.query;

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

    // Calculate the start date based on the period
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get analytics for the site
    const analytics = await prisma.analytics.findMany({
      where: {
        siteId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate summary statistics
    const totalPageViews = analytics.reduce((sum, record) => sum + record.pageViews, 0);
    const totalVisitors = analytics.reduce((sum, record) => sum + record.visitors, 0);

    // Group by page path to find popular pages
    const pageViewsByPath = {};
    analytics.forEach(record => {
      if (record.path) {
        pageViewsByPath[record.path] = (pageViewsByPath[record.path] || 0) + record.pageViews;
      }
    });

    // Sort pages by views
    const popularPages = Object.entries(pageViewsByPath)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Group by date for time series data
    const timeSeriesData = {};
    analytics.forEach(record => {
      const date = record.createdAt.toISOString().split('T')[0];
      if (!timeSeriesData[date]) {
        timeSeriesData[date] = {
          date,
          pageViews: 0,
          visitors: 0
        };
      }
      timeSeriesData[date].pageViews += record.pageViews;
      timeSeriesData[date].visitors += record.visitors;
    });

    res.json({
      summary: {
        totalPageViews,
        totalVisitors,
        popularPages
      },
      timeSeriesData: Object.values(timeSeriesData),
      rawData: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/analytics
 * @desc    Record analytics data (public endpoint for site visitors)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { siteId, path, referrer, userAgent, pageViews = 1, visitors = 1 } = req.body;

    // Validate required fields
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }

    // Check if the site exists
    const site = await prisma.site.findUnique({
      where: {
        id: siteId
      }
    });

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    // Create the analytics record
    const analytics = await prisma.analytics.create({
      data: {
        path,
        referrer,
        userAgent,
        pageViews,
        visitors,
        site: {
          connect: {
            id: siteId
          }
        }
      }
    });

    res.status(201).json(analytics);
  } catch (error) {
    console.error('Error recording analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
