import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/mongodb';
import { Upload, CheckCircle2, XCircle, AlertCircle, Clock, Palette, Sparkles, Sliders } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CustomDesignRequest {
  _id: string;
  imageUrl: string;
  color: string;
  size: string;
  neckStyle: string;
  sleeveStyle: string;
  otherDetails: string;
  status: 'pending' | 'accepted' | 'rejected';
  adminNotes?: string;
  createdAt: string;
}

export function CustomDesignsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'request' | 'my-requests'>('request');
  const [requests, setRequests] = useState<CustomDesignRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [color, setColor] = useState('Black');
  const [size, setSize] = useState('M');
  const [neckStyle, setNeckStyle] = useState('With Neck');
  const [sleeveStyle, setSleeveStyle] = useState('Sleeve');
  const [otherDetails, setOtherDetails] = useState('');

  // Dropdown options
  const colorOptions = ['Black', 'White', 'Gray', 'Red', 'Blue', 'Green', 'Navy', 'Yellow'];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (activeTab === 'my-requests') {
      fetchRequests();
    }
  }, [activeTab, user]);

  const fetchRequests = async () => {
    setLoadingHistory(true);
    setError('');
    try {
      const response = await apiService.getMyCustomDesigns();
      if (response.success) {
        setRequests(response.data);
      } else {
        setError(response.message || 'Failed to load requests');
      }
    } catch (err: any) {
      console.error('Error fetching custom requests:', err);
      setError(err.message || 'Error fetching request history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Please upload a valid PNG or JPG image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!imageFile) {
      setError('Please upload a design image (JPG/PNG).');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('color', color);
      formData.append('size', size);
      formData.append('neckStyle', neckStyle);
      formData.append('sleeveStyle', sleeveStyle);
      formData.append('otherDetails', otherDetails);

      const response = await apiService.createCustomDesign(formData);
      if (response.success) {
        setSuccess(true);
        // Clear form
        setImageFile(null);
        setImagePreview(null);
        setColor('Black');
        setSize('M');
        setNeckStyle('With Neck');
        setSleeveStyle('Sleeve');
        setOtherDetails('');
        // Switch to history tab after a small delay
        setTimeout(() => {
          setActiveTab('my-requests');
          setSuccess(false);
        }, 2000);
      } else {
        setError(response.message || 'Failed to submit request.');
      }
    } catch (err: any) {
      console.error('Error submitting design:', err);
      setError(err.message || 'An error occurred while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Pending Review
          </span>
        );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Custom T-Shirt Design Studio
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Bring your creative vision to life! Upload your design images, select your fit, neck and sleeve preferences, and our design team will review and tailor it to perfection.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('request')}
          className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'request'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          🎨 Request Custom Design
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`pb-4 px-2 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'my-requests'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          📂 My Requests ({requests.length})
        </button>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>Custom request submitted successfully! Redirecting to requests history...</div>
        </div>
      )}

      {/* Tab: Request Form */}
      {activeTab === 'request' && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Upload Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Design
              </h2>
              
              <div className="w-full">
                {imagePreview ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square flex items-center justify-center bg-slate-50 mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain max-h-[300px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-md"
                      title="Remove image"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl p-8 cursor-pointer transition-all aspect-square mb-4">
                    <Upload className="w-12 h-12 text-slate-400 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-slate-700 text-center">
                      Click to upload image
                    </span>
                    <span className="text-xs text-slate-400 text-center mt-1">
                      PNG, JPG, or JPEG (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed text-center">
                Please upload a high-resolution PNG or JPG image file with a clean design. Transparent backgrounds work best.
              </p>
            </div>
          </div>

          {/* Right Column: Specifications Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Customize Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-slate-500" />
                    Base Shirt Color
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                  >
                    {colorOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Size Selection
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                  >
                    {sizeOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Style configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Neck Style */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Neck Configuration
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['With Neck', 'Without Neck'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setNeckStyle(style)}
                        className={`px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          neckStyle === style
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleeve Style */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sleeve Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Sleeve', 'Sleeveless'].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setSleeveStyle(style)}
                        className={`px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          sleeveStyle === style
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Other Details */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Details & Specifications
                </label>
                <textarea
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
                  placeholder="Describe your request... e.g. placement size, text to add, material suggestions, or any design placement details."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading & Submitting...
                  </>
                ) : (
                  'Submit Design Request'
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Request History */}
      {activeTab === 'my-requests' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            Request History
          </h2>

          {loadingHistory ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              <p className="text-sm text-slate-500 font-medium">Loading your requests history...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center">
              <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">No custom designs found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
                You haven't submitted any custom design requests yet. Go back to the request form to submit your first design!
              </p>
              <button
                onClick={() => setActiveTab('request')}
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg text-sm shadow hover:bg-indigo-700 transition-all"
              >
                Create New Request
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="flex flex-col md:flex-row gap-6 p-5 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-md transition-all bg-slate-50/30"
                >
                  {/* Left: Design Image */}
                  <div className="w-full md:w-44 h-44 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 relative group">
                    <img
                      src={request.imageUrl}
                      alt="Custom Design"
                      className="w-full h-full object-contain p-2"
                    />
                    <a
                      href={request.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
                    >
                      View Full Size
                    </a>
                  </div>

                  {/* Right: Specifications & Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Bar: Date & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1.5 rounded-md">
                          Requested on {new Date(request.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>

                      {/* Specs Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: request.color }} />
                          Color: {request.color}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                          Size: {request.size}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                          {request.neckStyle}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                          {request.sleeveStyle}
                        </span>
                      </div>

                      {/* Description */}
                      {request.otherDetails && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-500 mb-1">Details & Instructions</p>
                          <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg">
                            {request.otherDetails}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Admin Reply Notes */}
                    {request.adminNotes && (
                      <div className={`mt-2 p-4 rounded-lg border text-sm leading-relaxed ${
                        request.status === 'accepted'
                          ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                          : 'bg-rose-50/50 border-rose-100 text-rose-900'
                      }`}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1">Admin Response</p>
                        <p className="font-medium">{request.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
