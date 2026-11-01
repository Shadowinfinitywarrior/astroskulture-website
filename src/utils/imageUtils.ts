/**
 * Image optimization utilities for Cloudinary and responsive web delivery.
 * Automatically converts heavy original uploads to modern AVIF/WebP formats with auto-compression.
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
  crop?: 'limit' | 'fill' | 'fit' | 'thumb';
}

/**
 * Injects optimized Cloudinary transformations into an image URL.
 * Example: https://res.cloudinary.com/dn8bo0nsr/image/upload/q_auto/f_auto/v1775574400/2_nr5mid.jpg
 * -> https://res.cloudinary.com/dn8bo0nsr/image/upload/f_auto,q_auto:good,w_400,c_limit/v1775574400/2_nr5mid.jpg
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
    quality = 'auto:good',
    format = 'auto',
    crop = 'limit'
  } = options;

  const transforms: string[] = [];
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(typeof quality === 'number' ? `q_${quality}` : `q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);

  const transformString = transforms.join(',');

  // If URL already has this exact transformation, avoid duplicate injection
  if (url.includes(`/${transformString}/`)) {
    return url;
  }

  // Cleanly replace any legacy transformation path segments between /upload/ and /v12345/ or filename
  return url.replace(/\/upload\/(?:[a-zA-Z0-9_:,]+\/)*(?:(v\d+)\/)?/, (_, version) => {
    if (version) {
      return `/upload/${transformString}/${version}/`;
    }
    return `/upload/${transformString}/`;
  });
}

/**
 * Generate a responsive srcSet string for Cloudinary images
 */
export function getCloudinarySrcSet(url?: string, widths = [280, 400, 600, 800]): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return '';
  }

  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w, quality: 'auto:good' })} ${w}w`)
    .join(', ');
}
