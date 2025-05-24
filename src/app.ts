import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import shortUrlRoutes from './routes/shortUrl.routes';
import { redirectToOriginalUrl } from './controllers/shortUrl.controller';

// Initialize dotenv
dotenv.config();

// Create Express app
const app: Express = express();

// Middleware
app.set('trust proxy', true);
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Routes
app.use('/api/urls', shortUrlRoutes);

app.get('/:shortcode', redirectToOriginalUrl);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Service is healthy' });
});

// Default route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'URL Shortener API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 route
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
});

export default app;
