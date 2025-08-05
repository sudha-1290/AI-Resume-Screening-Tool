import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'AI Resume Screening Tool API',
    version: '1.0.0',
    status: 'running'
  });
});

// Auth routes (placeholder)
app.post('/api/v1/auth/register', (req, res) => {
  res.status(501).json({ message: 'Registration endpoint - not implemented yet' });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.status(501).json({ message: 'Login endpoint - not implemented yet' });
});

// Resume routes (placeholder)
app.post('/api/v1/resumes/upload', (req, res) => {
  res.status(501).json({ message: 'Resume upload endpoint - not implemented yet' });
});

app.get('/api/v1/resumes', (req, res) => {
  res.status(501).json({ message: 'Get resumes endpoint - not implemented yet' });
});

// Job routes (placeholder)
app.post('/api/v1/jobs', (req, res) => {
  res.status(501).json({ message: 'Create job endpoint - not implemented yet' });
});

app.get('/api/v1/jobs', (req, res) => {
  res.status(501).json({ message: 'Get jobs endpoint - not implemented yet' });
});

// Screening routes (placeholder)
app.post('/api/v1/screening', (req, res) => {
  res.status(501).json({ message: 'Create screening endpoint - not implemented yet' });
});

app.get('/api/v1/screening', (req, res) => {
  res.status(501).json({ message: 'Get screenings endpoint - not implemented yet' });
});

// Analytics routes (placeholder)
app.get('/api/v1/analytics/dashboard', (req, res) => {
  res.status(501).json({ message: 'Dashboard analytics endpoint - not implemented yet' });
});

// Catch-all route for frontend
app.get('*', (req, res) => {
  res.json({
    message: 'AI Resume Screening Tool',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth/*',
      resumes: '/api/v1/resumes/*',
      jobs: '/api/v1/jobs/*',
      screening: '/api/v1/screening/*',
      analytics: '/api/v1/analytics/*'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 AI Resume Screening Tool server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base: http://localhost:${PORT}/api/v1`);
  });
}

export default app; 