const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const prisma = new PrismaClient();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

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
 * @route   GET /api/payments
 * @desc    Get all payments for a user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        plan: true
      }
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/payments/:id
 * @desc    Get a payment by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        plan: true
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user owns the payment
    if (payment.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a new payment order
 * @access  Private
 */
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes, planId } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes
    });

    // Save order in database
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount,
        currency,
        status: 'created',
        planId,
        user: {
          connect: {
            id: req.user.id
          }
        }
      }
    });

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      paymentId: payment.id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment signature
 * @access  Private
 */
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the payment
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user owns the payment
    if (payment.userId !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment status in database
    const updatedPayment = await prisma.payment.update({
      where: {
        id: paymentId
      },
      data: {
        status: 'completed',
        paymentId: razorpay_payment_id,
        updatedAt: new Date()
      }
    });

    // If payment is for a subscription plan, update user's subscription
    if (payment.planId) {
      // Get plan details
      const plan = await prisma.plan.findUnique({
        where: {
          id: payment.planId
        }
      });

      if (plan) {
        // Calculate expiry date based on plan duration
        const expiryDate = new Date();
        if (plan.duration === 'monthly') {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else if (plan.duration === 'yearly') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        // Update user's subscription
        await prisma.user.update({
          where: {
            id: req.user.id
          },
          data: {
            planId: plan.id,
            planExpiryDate: expiryDate
          }
        });
      }
    }

    res.json({ success: true, payment: updatedPayment });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

/**
 * @route   GET /api/payments/plans
 * @desc    Get all subscription plans
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc'
      }
    });

    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
