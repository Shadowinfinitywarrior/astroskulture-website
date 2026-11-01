/**
 * Image optimization utilities for Cloudinary and responsive web delivery.
 * Automatically converts heavy original uploads to modern AVIF/WebP formats with auto-compression.
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'good' | 'eco' | 'low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
  crop?: 'limit' | 'fill' | 'fit' | 'thumb';
}

/**
 * Injects Cloudinary transformations into an image URL.
 * Example: https://res.cloudinary.com/cloud/image/upload/v123/img.jpg
 * -> https://res.cloudinary.com/cloud/image/upload/f_auto,q_auto,w_800,c_limit/v123/img.jpg
 */
export function optimizeImageUrl(url?: string, options: ImageTransformOptions = {}): string {
  if (!url || typeof url !== 'string') {
    return '/api/placeholder/400/400';
  }

  // Handle local placeholders or non-Cloudinary images
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit'
  } = options;

  const transforms: string[] = [];
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);

  const transformString = transforms.join(',');

  // If URL already has this exact transformation, avoid duplicate injection
  if (url.includes(`/${transformString}/`)) {
    return url;
  }

  // Insert transformations immediately after /upload/
  return url.replace(/\/upload\/(?:v\d+\/)?/, (match) => {
    // Check if match already has version
    if (match.includes('/v')) {
      return `/upload/${transformString}/${match.substring(8)}`;
    }
    return `/upload/${transformString}/`;
  });
}

/**
 * Generate a responsive srcSet string for Cloudinary images
 */
export function getCloudinarySrcSet(url?: string, widths = [320, 480, 640, 800, 1024]): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return '';
  }

  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w, quality: 'auto' })} ${w}w`)
    .join(', ');
}
