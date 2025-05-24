import { body } from 'express-validator';

// Validation rules for creating a short URL
export const createShortUrlValidation = [
  body('originalUrl')
    .notEmpty()
    .withMessage('Original URL is required')
    .isURL()
    .withMessage('Invalid URL format'),

  body('domain').optional().isString().withMessage('Domain must be a string'),
];

// Validation rules for updating a short URL
export const updateShortUrlValidation = [
  body('originalUrl').optional().isURL().withMessage('Invalid URL format'),
];
