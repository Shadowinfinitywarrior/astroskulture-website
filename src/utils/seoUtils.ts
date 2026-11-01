/**
 * SEO & Structured Data Management Utility
 * Handles dynamic title, meta tags, canonical link, Open Graph, Twitter cards, and Schema.org JSON-LD
 */

export interface PageSeoConfig {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  ogPrice?: {
    amount: number;
    currency: string;
  };
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'ASTROS KULTURE | Premium Oversized Streetwear & Anime Fashion';
const DEFAULT_DESC = 'Discover premium oversized t-shirts, anime streetwear, and cosmic custom designs at Astros Kulture. High quality cotton, bold graphics, free shipping.';
const DEFAULT_IMAGE = 'https://astroskulture.in/logo.png';
const SITE_NAME = 'ASTROS KULTURE';

function setMetaTag(selector: string, attribute: string, value: string) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const [attrName, attrValue] = selector.replace(/meta\[|\]/g, '').split('=');
    element.setAttribute(attrName.trim(), attrValue.replace(/['"]/g, '').trim());
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setCanonicalUrl(url: string) {
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function updatePageSeo(config: PageSeoConfig) {
  if (typeof document === 'undefined') return;

  const title = config.title ? `${config.title}` : DEFAULT_TITLE;
  const description = config.description || DEFAULT_DESC;
  const canonicalUrl = config.canonicalUrl || window.location.origin + window.location.pathname;
  const ogImage = config.ogImage || DEFAULT_IMAGE;
  const ogType = config.ogType || 'website';

  // 1. Update Title
  document.title = title;

  // 2. Meta Description
  setMetaTag("meta[name='description']", 'content', description);

  // 3. Canonical Link
  setCanonicalUrl(canonicalUrl);

  // 4. OpenGraph Tags
  setMetaTag("meta[property='og:title']", 'content', title);
  setMetaTag("meta[property='og:description']", 'content', description);
  setMetaTag("meta[property='og:url']", 'content', canonicalUrl);
  setMetaTag("meta[property='og:type']", 'content', ogType);
  setMetaTag("meta[property='og:image']", 'content', ogImage);
  setMetaTag("meta[property='og:site_name']", 'content', SITE_NAME);

  // Product-specific OpenGraph price tags
  if (config.ogPrice) {
    setMetaTag("meta[property='product:price:amount']", 'content', config.ogPrice.amount.toFixed(2));
    setMetaTag("meta[property='product:price:currency']", 'content', config.ogPrice.currency);
  }

  // 5. Twitter Card Tags
  setMetaTag("meta[name='twitter:card']", 'content', 'summary_large_image');
  setMetaTag("meta[name='twitter:title']", 'content', title);
  setMetaTag("meta[name='twitter:description']", 'content', description);
  setMetaTag("meta[name='twitter:image']", 'content', ogImage);

  // 6. Schema.org JSON-LD Structured Data
  if (config.structuredData) {
    let scriptTag = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'dynamic-seo-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(config.structuredData);
  } else {
    const existing = document.getElementById('dynamic-seo-jsonld');
    if (existing) existing.remove();
  }
}
