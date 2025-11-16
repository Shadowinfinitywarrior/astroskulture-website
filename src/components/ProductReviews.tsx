import { useState, useEffect } from 'react';
import { Star, User, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  userId: {
    fullName: string;
  };
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadReviews();
    if (user) {
      loadUserReview();
    }
  }, [productId, user]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://astroskulture-website.onrender.com/api' : 'http://localhost:5000/api')}/reviews/product/${productId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviews(data.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadUserReview = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://astroskulture-website.onrender.com/api' : 'http://localhost:5000/api')}/reviews/user/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUserReview(data.data);
          setRating(data.data.rating);
          setTitle(data.data.title || '');
          setComment(data.data.comment || '');
        }
      }
    } catch (err) {
      console.error('Error loading user review:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to add a review');
      return;
    }

    if (!rating) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      
      const payload = {
        productId,
        rating,
        title: title || 'No Title',
        comment: comment || ''
      };

      const url = userReview
        ? `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://astroskulture-website.onrender.com/api' : 'http://localhost:5000/api')}/reviews/${userReview._id}`
        : `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://astroskulture-website.onrender.com/api' : 'http://localhost:5000/api')}/reviews`;

      const response = await fetch(url, {
        method: userReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccessMessage(userReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        setUserReview(data.data);
        
        // Reset form for new review
        if (!userReview) {
          setRating(0);
          setTitle('');
          setComment('');
        }
        
        // Reload reviews
        setTimeout(() => {
          loadReviews();
          setSuccessMessage('');
        }, 1500);
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://astroskulture-website.onrender.com/api' : 'http://localhost:5000/api')}/reviews/${userReview._id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccessMessage('Review deleted successfully');
        setUserReview(null);
        setRating(0);
        setTitle('');
        setComment('');
        
        setTimeout(() => {
          loadReviews();
          setSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 md:mt-12 border-t border-gray-200 pt-6 md:pt-8">
      <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Review Form */}
      {user ? (
        <div className="bg-gray-50 p-4 md:p-6 rounded-lg mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            {userReview ? 'Update Your Review' : 'Share Your Review'}
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 md:w-8 md:h-8 ${
                        value <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your review"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm md:text-base"
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product"
                rows={4}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none text-sm md:text-base"
                maxLength={500}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 md:gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {submitting && <Loader className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
              </button>

              {userReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  disabled={submitting}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors text-sm md:text-base"
                >
                  Delete Review
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 p-4 md:p-6 rounded-lg mb-6 text-center">
          <p className="text-blue-800 text-sm md:text-base">
            Please <a href="#" className="font-semibold underline hover:no-underline">login</a> to share your review
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 md:space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-6 h-6 animate-spin text-red-600" />
          </div>
        ) : reviews.length > 0 ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
            </p>
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3 md:mb-4 flex-wrap gap-2">
                  <div className="flex items-start gap-3 md:gap-4 flex-grow">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm md:text-base break-words">
                          {review.userId?.fullName || 'Anonymous'}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs md:text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">
                    {review.title}
                  </h4>
                )}

                {review.comment && (
                  <p className="text-gray-700 text-sm md:text-base mb-3 md:mb-4 leading-relaxed">
                    {review.comment}
                  </p>
                )}

                {review.helpfulCount > 0 && (
                  <p className="text-xs text-gray-500">
                    {review.helpfulCount} people found this helpful
                  </p>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm md:text-base">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}
