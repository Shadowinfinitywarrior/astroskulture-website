// backend/src/routes/feeds.js
// Meta Product Catalog CSV, Google Merchant Center XML Feed, and Dynamic Sitemap XML

import express from 'express';
import Product from '../models/Product.js';
import Blog from '../models/Blog.js';

const router = express.Router();

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\s+/g, ' ').trim()}"`;
const money = (n) => `${Number(n).toFixed(2)} INR`;

const xmlEscape = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * 1. Meta Product Catalog CSV Feed
 * GET /feeds/meta-catalog.csv or /api/feeds/meta-catalog.csv
 */
router.get('/meta-catalog.csv', async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } }).lean();
    const siteUrl = process.env.SITE_URL || 'https://astroskulture.in';

    const cols = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'sale_price',
      'link',
      'image_link',
      'additional_image_link',
      'brand',
      'item_group_id',
      'size',
      'color',
      'gender',
      'age_group',
      'google_product_category',
      'product_type',
    ];

    const rows = [];

    for (const p of products) {
      const onSale = p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price;
      const primaryImage = p.images?.[0]?.url || `${siteUrl}/logo.png`;
      const additionalImages = (p.images || []).slice(1, 6).map((img) => img.url).filter(Boolean).join(',');
      const sizes = Array.isArray(p.sizes) && p.sizes.length > 0
        ? p.sizes
        : [{ size: 'Free Size', stock: p.totalStock || 10 }];

      for (const s of sizes) {
        const variantId = `${p._id}_${s.size}`;
        const isAvailable = (s.stock !== undefined ? s.stock > 0 : (p.totalStock || 0) > 0);

        rows.push(
          [
            variantId,
            p.name,
            p.description || p.name,
            isAvailable ? 'in stock' : 'out of stock',
            'new',
            money(p.price),
            onSale ? money(p.discountPrice) : '',
            `${siteUrl}/product/${p.slug}`,
            primaryImage,
            additionalImages,
            'ASTROS KULTURE', // Hard-code brand per BRD-01
            String(p._id),
            s.size,
            p.colors?.[0] || 'Black',
            'unisex',
            'adult',
            'Apparel & Accessories > Clothing > Shirts & Tops',
            p.category || 'Oversized T-Shirts',
          ]
            .map(esc)
            .join(',')
        );
      }
    }

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=900');
    res.send([cols.join(','), ...rows].join('\n'));
  } catch (error) {
    console.error('[Feed Error - Meta CSV]', error);
    res.status(500).send('Error generating catalog feed');
  }
});

/**
 * 2. Google Merchant Center RSS 2.0 XML Feed
 * GET /feeds/google-merchant.xml or /api/feeds/google-merchant.xml
 */
router.get('/google-merchant.xml', async (req, res) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } }).lean();
    const siteUrl = process.env.SITE_URL || 'https://astroskulture.in';

    let itemsXml = '';

    for (const p of products) {
      const onSale = p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price;
      const primaryImage = p.images?.[0]?.url || `${siteUrl}/logo.png`;
      const additionalImages = (p.images || []).slice(1, 5).map((img) => img.url).filter(Boolean);
      const isAvailable = (p.totalStock !== undefined ? p.totalStock > 0 : true) ||
        (Array.isArray(p.sizes) && p.sizes.some((s) => s.stock > 0));

      const priceStr = `${Number(p.price).toFixed(2)} INR`;
      const salePriceStr = onSale ? `${Number(p.discountPrice).toFixed(2)} INR` : '';

      itemsXml += `
    <item>
      <g:id>${xmlEscape(p._id)}</g:id>
      <g:title>${xmlEscape(p.name)}</g:title>
      <g:description>${xmlEscape(p.description || p.name)}</g:description>
      <g:link>${xmlEscape(`${siteUrl}/product/${p.slug}`)}</g:link>
      <g:image_link>${xmlEscape(primaryImage)}</g:image_link>
      ${additionalImages.map(img => `<g:additional_image_link>${xmlEscape(img)}</g:additional_image_link>`).join('\n      ')}
      <g:condition>new</g:condition>
      <g:availability>${isAvailable ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${priceStr}</g:price>
      ${salePriceStr ? `<g:sale_price>${salePriceStr}</g:sale_price>` : ''}
      <g:brand>ASTROS KULTURE</g:brand>
      <g:item_group_id>${xmlEscape(p._id)}</g:item_group_id>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops</g:google_product_category>
      <g:product_type>${xmlEscape(p.category || 'Oversized T-Shirts')}</g:product_type>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>ASTROS KULTURE Products Feed</title>
    <link>${siteUrl}</link>
    <description>Premium Space &amp; Anime Streetwear Apparel Products Catalog</description>${itemsXml}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=900');
    res.send(xml);
  } catch (error) {
    console.error('[Feed Error - Google Merchant XML]', error);
    res.status(500).send('Error generating Google Merchant feed');
  }
});

/**
 * 3. Dynamic Sitemap XML (Products, Categories, Blogs, Policies)
 * GET /sitemap.xml, /feeds/sitemap.xml or /api/feeds/sitemap.xml
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = process.env.SITE_URL || 'https://astroskulture.in';
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${siteUrl}/shop`, changefreq: 'daily', priority: '0.9' },
      { loc: `${siteUrl}/categories`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${siteUrl}/custom-design`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${siteUrl}/blog`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${siteUrl}/privacy-policy`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${siteUrl}/terms-of-service`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${siteUrl}/shipping-policy`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${siteUrl}/return-refund-policy`, changefreq: 'monthly', priority: '0.5' },
    ];

    // Fetch active products
    const products = await Product.find({ isActive: { $ne: false } })
      .select('slug updatedAt')
      .lean();

    // Fetch published blogs
    const blogs = await Blog.find({ isPublished: true })
      .select('slug updatedAt')
      .lean();

    let urlsXml = '';

    // Static Pages
    for (const p of staticPages) {
      urlsXml += `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
    }

    // Dynamic Product Pages
    for (const prod of products) {
      if (!prod.slug) continue;
      const mod = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : today;
      urlsXml += `
  <url>
    <loc>${siteUrl}/product/${xmlEscape(prod.slug)}</loc>
    <lastmod>${mod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Dynamic Blog Pages
    for (const b of blogs) {
      if (!b.slug) continue;
      const mod = b.updatedAt ? new Date(b.updatedAt).toISOString().split('T')[0] : today;
      urlsXml += `
  <url>
    <loc>${siteUrl}/blog/${xmlEscape(b.slug)}</loc>
    <lastmod>${mod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsXml}
</urlset>`;

    res.set('Content-Type', 'text/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('[Feed Error - Dynamic Sitemap]', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
