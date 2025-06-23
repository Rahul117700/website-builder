const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const indexRoutes = require('./src/api/routes/index');
const authRoutes = require('./src/api/routes/auth');
const sitesRoutes = require('./src/api/routes/sites');
const pagesRoutes = require('./src/api/routes/pages');
const bookingsRoutes = require('./src/api/routes/bookings');
const analyticsRoutes = require('./src/api/routes/analytics');
const paymentsRoutes = require('./src/api/routes/payments');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentsRoutes);

// Subdomain handling middleware
app.use(async (req, res, next) => {
  const host = req.headers.host;
  
  // Skip for localhost or direct access to the main domain
  if (host.startsWith('localhost') || !host.includes('.')) {
    return next();
  }
  
  // Extract subdomain
  const parts = host.split('.');
  const isCustomDomain = parts.length === 2; // e.g., example.com
  const isSubdomain = parts.length > 2; // e.g., subdomain.example.com
  
  try {
    let site;
    
    if (isCustomDomain) {
      // Check if this is a custom domain
      site = await prisma.site.findUnique({
        where: { customDomain: host },
        include: { pages: true }
      });
    } else if (isSubdomain) {
      // Check if this is a subdomain
      const subdomain = parts[0];
      site = await prisma.site.findUnique({
        where: { subdomain },
        include: { pages: true }
      });
    }
    
    if (site) {
      // Store site data in request for use in routes
      req.site = site;
      
      // Record analytics
      await prisma.analytics.create({
        data: {
          path: req.path,
          pageViews: 1,
          visitors: 1,
          referrer: req.headers.referer || '',
          userAgent: req.headers['user-agent'] || '',
          site: {
            connect: {
              id: site.id
            }
          }
        }
      });
      
      // Continue to the site rendering routes
      return next();
    }
  } catch (error) {
    console.error('Error processing subdomain:', error);
  }
  
  // If no site found or error, continue to normal routes
  next();
});

// Site rendering route for subdomains
app.get('*', async (req, res) => {
  if (req.site) {
    const path = req.path === '/' ? '/home' : req.path;
    const page = req.site.pages.find(p => p.slug === path.substring(1) && p.published);
    
    if (page) {
      // In a real implementation, this would render the page using the site's template
      // For now, we'll just return the page data
      return res.json({
        site: {
          name: req.site.name,
          template: req.site.template,
          primaryColor: req.site.primaryColor,
          secondaryColor: req.site.secondaryColor,
        },
        page: {
          title: page.title,
          content: page.content,
        }
      });
    }
    
    // Page not found for this site
    return res.status(404).json({ error: 'Page not found' });
  }
  
  // Not a subdomain request or site not found
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// UserId to socket mapping
const userSockets = new Map();

io.on('connection', (socket) => {
  // Listen for user identification
  socket.on('identify', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
    }
  });
});

// Export io and userSockets for use in notification logic
module.exports.io = io;
module.exports.userSockets = userSockets;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO server running');
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
