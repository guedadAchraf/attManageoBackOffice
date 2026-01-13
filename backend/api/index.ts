import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/users';
import formRoutes from '../src/routes/forms';
import excelRoutes from '../src/routes/excel';
import testRoutes from '../src/routes/test';

// Middleware
import { errorHandler } from '../src/middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://att-forms-frontend.vercel.app',
        'https://your-frontend-domain.vercel.app',
        /\.vercel\.app$/
      ]
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ATT Forms API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      forms: '/api/forms',
      excel: '/api/excel',
      test: '/api/test'
    }
  });
});

// Health check - MUST come before other routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
    cors: 'Enabled',
    version: '1.0.0'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/test', testRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/',
      '/api/health',
      '/api/auth/*',
      '/api/users/*',
      '/api/forms/*',
      '/api/excel/*',
      '/api/test/*'
    ]
  });
});

export default app;