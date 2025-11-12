import { useEffect, useState } from 'react';
import { ArrowRight, Package } from 'lucide-react';
import { apiService } from '../lib/mongodb';
import type { Category } from '../lib/types';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface CategoriesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function CategoriesPage({ onNavigate }: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setError('');
      const response = await apiService.getCategories();
      
      if (response.success) {
        setCategories(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Categories</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadCategories}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Shop by Category
            </h1>
            <p className="text-base md:text-lg text-gray-100 max-w-2xl mx-auto">
              Explore our premium fits crafted for everyday confidence
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No categories available</p>
              <button
                onClick={loadCategories}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => onNavigate('shop', { category: category.slug })}
                  className="group relative h-64 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {/* Category Image */}
                  <img
                    src={category.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl mb-2 group-hover:text-red-400 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center text-white group-hover:text-red-400 transition-colors">
                      <span className="text-sm font-medium">Shop Now</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-600 mb-6">
            Browse our complete collection of premium streetwear products
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center space-x-2 font-medium"
          >
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}