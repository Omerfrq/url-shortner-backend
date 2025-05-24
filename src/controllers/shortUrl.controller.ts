import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { isValidUrl } from '../utils/shortcodeGenerator';
import { fetchMetaTags } from '../utils/meta-tags';
import ShortUrl from '../models/ShortUrl';
import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  return typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress || '';
}

export const createShortUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const deviceId = req.headers['x-device-id'];

    if (!deviceId) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required',
      });
      return;
    }

    const { originalUrl } = req.body;

    const domain = `${req.protocol}://${req.get('host')}`;

    if (!isValidUrl(originalUrl)) {
      res.status(400).json({
        success: false,
        message: 'Invalid URL format',
      });
      return;
    }

    const shortcode = nanoid(6);

    const requestString = `smi.to${shortcode}`;

    const existingUrl = await ShortUrl.findOne({ requestString });
    if (existingUrl) {
      res.status(409).json({
        success: false,
        message: 'Shortcode already in use',
      });
      return;
    }

    // Fetch meta tags from the original URL
    const metaTags = await fetchMetaTags(originalUrl);

    const newShortUrl = new ShortUrl({
      shortcode: requestString,
      domain: domain,
      deviceId: deviceId,
      originalUrl,
      metaTags,
    });

    const savedUrl = await newShortUrl.save();

    res.status(201).json({
      success: true,
      data: {
        id: savedUrl._id,
        shortcode: savedUrl.shortcode,
        originalUrl: savedUrl.originalUrl,
        shortUrl: `${savedUrl.domain}/${savedUrl.shortcode}`,
        metaTags: savedUrl.metaTags,
        createdAt: savedUrl.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while creating short URL',
    });
  }
};

// Get all short URLs
export const getAllShortUrls = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const deviceId = req.headers['x-device-id'];

    // Optional filtering by deviceId
    const filter: { deviceId?: string } = {};
    if (deviceId) {
      filter.deviceId = deviceId as string;
    }

    // Get URLs
    const shortUrls = await ShortUrl.find(filter)
      .sort({ clicks: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await ShortUrl.countDocuments(filter);

    res.status(200).json({
      success: true,
      links: shortUrls.map((url) => ({
        id: url._id,
        shortcode: url.shortcode,
        originalUrl: url.originalUrl,
        shortUrl: `${url.domain}/${url.shortcode}`,
        clicks: url.clicks,
        metaTags: url.metaTags,
        createdAt: url.createdAt,
        visits: url.visits,
      })),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching short URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching short URLs',
    });
  }
};

// Get a specific short URL
export const getShortUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const shortUrl = await ShortUrl.findById(req.params.id);

    if (!shortUrl) {
      res.status(404).json({
        success: false,
        message: 'Short URL not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      link: shortUrl,
    });
  } catch (error) {
    console.error('Error fetching short URL:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching short URL',
    });
  }
};

export const redirectToOriginalUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { shortcode } = req.params;

    const shortUrl = await ShortUrl.findOne({ shortcode });

    if (!shortUrl) {
      res.status(404).json({
        success: false,
        message: 'Short URL not found',
      });
      return;
    }

    // Parse user agent
    const ua = new UAParser(req.headers['user-agent']);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    // Get IP and location
    let ip = getClientIp(req);

    // Handle IPv6-mapped IPv4
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    console.log(ip);
    const geo = geoip.lookup(ip);
    console.log({ geo });

    // Create visit record
    const visit = {
      timestamp: new Date(),
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      referrer: req.headers.referer || 'Direct',
      deviceType: device.type || 'desktop',
      browser: `${browser.name || 'Unknown'} ${browser.version || ''}`,
      os: `${os.name || 'Unknown'} ${os.version || ''}`,
      platform:
        device.type === 'mobile'
          ? os.name === 'iOS'
            ? 'iOS'
            : 'Android'
          : 'Desktop',
      ip: process.env.NODE_ENV === 'production' ? ip : 'localhost',
    };

    // Update shortUrl with visit information
    shortUrl.visits.push(visit);
    shortUrl.clicks += 1;
    await shortUrl.save();

    res.redirect(shortUrl.originalUrl);
  } catch (error) {
    console.error('Error redirecting to original URL:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred during redirect',
    });
  }
};
