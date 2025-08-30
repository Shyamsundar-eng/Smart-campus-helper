import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import quizRoutes from './routes/quiz.js';
import remindersRoutes from './routes/reminders.js';
import chatRoutes from './routes/chat.js';
import marketplaceRoutes from './routes/marketplace.js';
import helloRoutes from './routes/hello.js';
import booksRoutes from './routes/books.js';
import dashboardRoutes from './routes/dashboard.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

// Import Google API configuration
import { initializeGoogleAPIs } from './config/googleAPIs.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

app.use(limiter);
app.use(speedLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Serve frontend static files (production build)
const frontendDistPath = join(__dirname, '../dist');
app.use(express.static(frontendDistPath));

// Serve index.html for any non-API route (SPA fallback)
app.get(/^\/(?!api|uploads|health).*/, (req, res) => {
  res.sendFile(join(frontendDistPath, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Collegial Mate Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/hello', helloRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/notes', authMiddleware, notesRoutes);
app.use('/api/quiz', authMiddleware, quizRoutes);
app.use('/api/reminders', authMiddleware, remindersRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/marketplace', authMiddleware, marketplaceRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`
  });
});

// Initialize Google APIs
initializeGoogleAPIs();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Collegial Mate Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
