import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// Middleware
app.use(cors({
  origin: env.nodeEnv === 'development' ? '*' : env.corsOrigin,
  credentials: env.nodeEnv !== 'development',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    app.listen(env.port, () => {
      console.log('='.repeat(70));
      console.log('Nola God Level Backend API');
      console.log('='.repeat(70));
      console.log(`✓ Server running on port ${env.port}`);
      console.log(`✓ Environment: ${env.nodeEnv}`);
      console.log(`✓ API URL: http://localhost:${env.port}/api`);
      console.log(`✓ Health check: http://localhost:${env.port}/api/health`);
      console.log('='.repeat(70));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();
