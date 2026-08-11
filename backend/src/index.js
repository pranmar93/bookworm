require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Documentation
try {
  const swaggerDoc = YAML.load(path.join(__dirname, '../openapi.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
    customSiteTitle: 'BookWorm API',
    customCss: '.swagger-ui .topbar { background-color: #1e3a5f; }',
  }));
} catch (err) {
  console.warn('OpenAPI spec not found, skipping docs endpoint');
}

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const authorRoutes = require('./routes/authors');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const addressRoutes = require('./routes/addresses');
const recommendationRoutes = require('./routes/recommendations');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/authors', authorRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'BookWorm API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 BookWorm API running on http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
