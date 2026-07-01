import Product from '../models/Product.js';
import Category from '../models/Category.js';

export async function seedInMemoryDb() {
  try {
    console.log('🗑️ Clearing in-memory data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ In-memory data cleared');

    // Create categories
    console.log('📂 Creating categories...');
    const categories = [
      {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Comfortable and stylish t-shirts for everyday wear',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Jackets',
        slug: 'jackets',
        description: 'Warm and fashionable jackets for all seasons',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Cozy hoodies for comfortable casual wear',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        displayOrder: 3,
        isActive: true
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Categories created:', createdCategories.length);

    // Create products
    console.log('🛍️ Creating products...');
    const products = [
      {
        name: 'Classic White T-Shirt',
        slug: 'classic-white-tshirt',
        description: 'Premium quality cotton t-shirt for everyday wear. Made from 100% organic cotton for maximum comfort and durability.',
        price: 2999, // in cents/paisa
        discountPrice: 1999,
        images: [
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', alt: 'White T-Shirt Front' }
        ],
        sizes: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 8 },
          { size: 'XL', stock: 5 }
        ],
        category: createdCategories[0]._id,
        isFeatured: true,
        isActive: true,
        rating: 4.5,
        reviewCount: 24
      },
      {
        name: 'Vintage Denim Jacket',
        slug: 'vintage-denim-jacket',
        description: 'Classic denim jacket with a vintage wash. Perfect for layering in any season with multiple pockets and durable construction.',
        price: 4999,
        discountPrice: 3999,
        images: [
          { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', alt: 'Denim Jacket' }
        ],
        sizes: [
          { size: 'M', stock: 5 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 3 }
        ],
        category: createdCategories[1]._id,
        isFeatured: true,
        isActive: true,
        rating: 4.8,
        reviewCount: 18
      },
      {
        name: 'Premium Black Hoodie',
        slug: 'premium-black-hoodie',
        description: 'Comfortable and warm black hoodie with front pocket. Perfect for casual outings and cool weather.',
        price: 3599,
        discountPrice: 2999,
        images: [
          { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', alt: 'Black Hoodie' }
        ],
        sizes: [
          { size: 'S', stock: 8 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 6 }
        ],
        category: createdCategories[2]._id,
        isFeatured: false,
        isActive: true,
        rating: 4.3,
        reviewCount: 15
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Products created:', products.length);

    console.log('\n🎉 IN-MEMORY SEED DATA CREATED SUCCESSFULLY!');
    console.log('══════════════════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('   📂 Categories:', createdCategories.length);
    console.log('   🛍️ Products:', products.length);
    console.log('══════════════════════════════════════════════════');
  } catch (error) {
    console.error('❌ ERROR SEEDING IN-MEMORY DATA:', error.message);
  }
}
