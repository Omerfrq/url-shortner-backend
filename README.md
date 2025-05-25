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
