// backend/src/routes/feeds.js
// Meta Product Catalog & Google Merchant CSV Feed

import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\s+/g, ' ').trim()}"`;
const money = (n) => `${Number(n).toFixed(2)} INR`;

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
    console.error('[Feed Error]', error);
    res.status(500).send('Error generating catalog feed');
  }
});

export default router;
