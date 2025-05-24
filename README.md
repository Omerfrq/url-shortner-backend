# URL Shortener API

A RESTful API for URL shortening built with TypeScript, Express.js, and MongoDB.

## Features

- Generate short URLs with custom or auto-generated shortcodes
- Track clicks and usage statistics
- Associate URLs with device IDs for user tracking
- Full CRUD operations for URL management
- Custom domain support
- RESTful API with validation and error handling

## Requirements

- Node.js 14+ and npm
- MongoDB 4.4+

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/url-shortener
NODE_ENV=development
BASE_URL=http://localhost:3000
```

## Running the Application

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

## API Documentation

### Create a Short URL

`POST /api/urls`

Request Body:

```json
{
  "originalUrl": "https://example.com/very/long/url/that/needs/shortening",
  "deviceId": "user123", // optional
  "domain": "short.io", // optional
  "customShortcode": "mylink" // optional
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "5f8a7b2d4e3c2b1a0c9d8e7f",
    "shortcode": "mylink",
    "originalUrl": "https://example.com/very/long/url/that/needs/shortening",
    "shortUrl": "http://short.io/mylink",
    "createdAt": "2023-01-01T12:00:00.000Z"
  }
}
```

### Get All Short URLs

`GET /api/urls?page=1&limit=10&deviceId=user123`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "5f8a7b2d4e3c2b1a0c9d8e7f",
      "shortcode": "mylink",
      "originalUrl": "https://example.com/very/long/url/that/needs/shortening",
      "shortUrl": "http://short.io/mylink",
      "clicks": 5,
      "createdAt": "2023-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "pages": 2,
    "limit": 10
  }
}
```

### Redirect to Original URL

`GET /api/urls/redirect/:shortcode`

### Get a Short URL by ID

`GET /api/urls/:id`

### Update a Short URL

`PUT /api/urls/:id`

### Delete a Short URL

`DELETE /api/urls/:id`