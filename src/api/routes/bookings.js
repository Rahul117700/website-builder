const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { io, userSockets } = require('../../../server');

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
 * @route   GET /api/bookings
 * @desc    Get all bookings for a site
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

    // Get bookings for the site
    const bookings = await prisma.booking.findMany({
      where: {
        siteId
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get a booking by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        site: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the site
    if (booking.site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (public endpoint for site visitors)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, bookingDate, numberOfPeople, message, siteId } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !bookingDate || !numberOfPeople || !siteId) {
      return res.status(400).json({ error: 'Please provide all required fields' });
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

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        phone,
        bookingDate: new Date(bookingDate),
        numberOfPeople,
        message,
        status: 'pending',
        site: {
          connect: {
            id: siteId
          }
        }
      }
    });

    // Create a notification for the site owner
    const notification = await prisma.notification.create({
      data: {
        userId: site.userId,
        type: 'booking',
        message: `New booking from ${name} on ${site.name}`,
      }
    });

    // Emit real-time notification if owner is connected
    const socketId = userSockets.get(site.userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update a booking status
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Get the booking
    const existingBooking = await prisma.booking.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        site: true
      }
    });

    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the site
    if (existingBooking.site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: {
        id: req.params.id
      },
      data: {
        status: status || existingBooking.status,
        notes: notes !== undefined ? notes : existingBooking.notes
      }
    });

    // TODO: Send email notification to customer about status change

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete a booking
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        site: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the site
    if (booking.site.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Delete booking
    await prisma.booking.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
