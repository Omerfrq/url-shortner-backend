import { Router } from 'express';
import {
  createShortUrl,
  getAllShortUrls,
  getShortUrl,
} from '../controllers/shortUrl.controller';

const router = Router();

// Create a new short URL
router.post('/', createShortUrl);

// Get all short URLs (with optional filtering and pagination)
router.get('/', getAllShortUrls);

// Get a specific short URL by ID
router.get('/:id', getShortUrl);

// Redirect to original URL from shortcode

export default router;
