import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

interface MetaTags {
  title?: string;
  description?: string;
  favicon?: string;
  ogImage?: string;
}

export async function fetchMetaTags(url: string): Promise<MetaTags> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL: ${response.status} ${response.statusText}`
      );
    }

    const html = await response.text();

    if (!html) {
      throw new Error('Empty HTML response');
    }

    const $ = cheerio.load(html);

    const metaTags: MetaTags = {
      title:
        $('title').first().text() ||
        $('meta[property="og:title"]').attr('content'),
      description:
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content'),
      ogImage: $('meta[property="og:image"]').attr('content'),
      favicon:
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        '/favicon.ico', // fallback to default favicon path
    };

    // Handle relative URLs
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // Convert relative favicon URL to absolute
    if (metaTags.favicon && !metaTags.favicon.startsWith('http')) {
      metaTags.favicon = metaTags.favicon.startsWith('/')
        ? `${baseUrl}${metaTags.favicon}`
        : `${baseUrl}/${metaTags.favicon}`;
    }

    // Convert relative og:image URL to absolute
    if (metaTags.ogImage && !metaTags.ogImage.startsWith('http')) {
      metaTags.ogImage = metaTags.ogImage.startsWith('/')
        ? `${baseUrl}${metaTags.ogImage}`
        : `${baseUrl}/${metaTags.ogImage}`;
    }

    return metaTags;
  } catch (error) {
    console.error('Error fetching meta tags:', error);
    // Return empty object but don't fail the entire URL shortening process
    return {};
  }
}
