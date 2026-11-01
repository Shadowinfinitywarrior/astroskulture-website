import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/mongodb';
import { Upload, CheckCircle2, XCircle, AlertCircle, Clock, Palette, Sparkles, Sliders, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CustomDesignRequest {
  _id: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  imageUrl: string;
  color: string;
  size: string;
  neckStyle: string;
  sleeveStyle: string;
  otherDetails: string;
  whatsappNumber: string;
  completedFrontDesignUrl?: string;
  completedBackDesignUrl?: string;
  completedDesignUrl?: string;
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

  // Form State: Front View & Back View files
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);

  const [color, setColor] = useState('Black');
  const [size, setSize] = useState('M');
  const [neckStyle, setNeckStyle] = useState('Oversized');
  const [sleeveStyle, setSleeveStyle] = useState('Half Sleeve');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [otherDetails, setOtherDetails] = useState('');

  // Dropdown options
  const colorOptions = ['Black', 'White', 'Gray', 'Red', 'Blue', 'Green', 'Navy', 'Yellow'];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    fetchRequests();
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

  const validateAndReadFile = (file: File, onSuccess: (file: File, preview: string) => void) => {
    setError('');
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Please upload a valid PNG or JPG image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onSuccess(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndReadFile(file, (f, preview) => {
      setFrontImageFile(f);
      setFrontImagePreview(preview);
    });
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndReadFile(file, (f, preview) => {
      setBackImageFile(f);
      setBackImagePreview(preview);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!frontImageFile && !backImageFile) {
      setError('Please upload at least one design image (Front View or Back View).');
      return;
    }

    if (!whatsappNumber.trim()) {
      setError('Please enter your WhatsApp number (mandatory).');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      if (frontImageFile) {
        formData.append('frontImage', frontImageFile);
      }
      if (backImageFile) {
        formData.append('backImage', backImageFile);
      }
      formData.append('color', color);
      formData.append('size', size);
      formData.append('neckStyle', neckStyle);
      formData.append('sleeveStyle', sleeveStyle);
      formData.append('whatsappNumber', whatsappNumber.trim());
      formData.append('otherDetails', otherDetails);

      const response = await apiService.createCustomDesign(formData);
      if (response.success) {
        setSuccess(true);
        // Clear form
        setFrontImageFile(null);
        setFrontImagePreview(null);
        setBackImageFile(null);
        setBackImagePreview(null);
        setColor('Black');
        setSize('M');
        setNeckStyle('Oversized');
        setSleeveStyle('Half Sleeve');
        setWhatsappNumber('');
        setOtherDetails('');
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

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom design request? This will permanently remove it from the database.')) {
      return;
    }

    try {
      const response = await apiService.deleteCustomDesign(id);
      if (response.success) {
        setRequests((prev) => prev.filter((r) => r._id !== id));
      } else {
        setError(response.message || 'Failed to delete request.');
      }
    } catch (err: any) {
      console.error('Error deleting request:', err);
      setError(err.message || 'Failed to delete request.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100/80 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4" />
          Astros Studio
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Custom T-Shirt Studio
        </h1>
        <p className="mt-2 text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          Bring your creative vision to life. Upload front and back designs, choose your fit and sleeve preferences, and our design team will craft your custom piece.
        </p>

        {/* Tab Controls */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('request')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'request'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Request Custom Design
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'my-requests'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Requests
              {requests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-red-600 text-white font-bold">
                  {requests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            Your custom design request has been submitted successfully! Redirecting to your request history...
          </div>
        </div>
      )}

      {/* Tab: Request Form */}
      {activeTab === 'request' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Image Uploads (Two Sections: Front View and Back View) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-600" />
              Upload Design Artwork (Front & Back Views)
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Upload artwork for the front view, back view, or both. High-resolution PNG or JPG with transparent background works best.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Front View Upload */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                      Front View Design
                    </span>
                    {frontImageFile && (
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Selected
                      </span>
                    )}
                  </div>

                  {frontImagePreview ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square flex items-center justify-center bg-white mb-3">
                      <img
                        src={frontImagePreview}
                        alt="Front View Preview"
                        className="w-full h-full object-contain max-h-[260px] p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFrontImageFile(null);
                          setFrontImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-md"
                        title="Remove image"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50/20 rounded-xl p-6 cursor-pointer transition-all aspect-square mb-3 bg-white">
                      <Upload className="w-10 h-10 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-700 text-center">
                        Upload Front View
                      </span>
                      <span className="text-[10px] text-slate-400 text-center mt-1">
                        PNG, JPG, or JPEG (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFrontFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Recommended for chest graphics, pocket logos, or front center art.
                </p>
              </div>

              {/* 2. Back View Upload */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                      Back View Design
                    </span>
                    {backImageFile && (
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Selected
                      </span>
                    )}
                  </div>

                  {backImagePreview ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square flex items-center justify-center bg-white mb-3">
                      <img
                        src={backImagePreview}
                        alt="Back View Preview"
                        className="w-full h-full object-contain max-h-[260px] p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBackImageFile(null);
                          setBackImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-md"
                        title="Remove image"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50/20 rounded-xl p-6 cursor-pointer transition-all aspect-square mb-3 bg-white">
                      <Upload className="w-10 h-10 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-700 text-center">
                        Upload Back View
                      </span>
                      <span className="text-[10px] text-slate-400 text-center mt-1">
                        PNG, JPG, or JPEG (Max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleBackFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Recommended for full-back prints, large typography, or artwork.
                </p>
              </div>
            </div>
          </div>

          {/* Specifications Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-red-600" />
              Customize Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Base Color */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-slate-500" />
                  Base Shirt Color
                </label>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-medium"
                >
                  {colorOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Size Selection
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-medium"
                >
                  {sizeOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Neck / Fit & Sleeve Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Neck Configuration: Oversized vs Normal */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Neck Configuration (Fit Style)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Oversized', 'Normal'].map((style) => (
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

              {/* Sleeve Style: Full Sleeve vs Half Sleeve */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sleeve Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Full Sleeve', 'Half Sleeve'].map((style) => (
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

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Enter your WhatsApp number (e.g. +91 9876543210)"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
                required
              />
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Additional Details & Specifications
              </label>
              <textarea
                value={otherDetails}
                onChange={(e) => setOtherDetails(e.target.value)}
                placeholder="Describe your design specifics: placement size, text to add, material suggestions, or front/back print instructions."
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
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
              <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
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
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90 text-white font-semibold rounded-lg text-sm shadow transition-all"
              >
                Create New Request
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="flex flex-col lg:flex-row gap-6 p-5 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-md transition-all bg-slate-50/30"
                >
                  {/* Left: Design Thumbnails (Front & Back) */}
                  <div className="flex gap-3 flex-shrink-0">
                    {/* Front View */}
                    {(request.frontImageUrl || request.imageUrl) && (
                      <div className="w-32 h-36 rounded-lg overflow-hidden border border-slate-200 bg-white flex flex-col items-center justify-between p-1.5 relative group">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Front</span>
                        <img
                          src={request.frontImageUrl || request.imageUrl}
                          alt="Front Design"
                          className="w-full h-24 object-contain"
                        />
                        <a
                          href={request.frontImageUrl || request.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold cursor-pointer"
                        >
                          View Full
                        </a>
                      </div>
                    )}

                    {/* Back View */}
                    {request.backImageUrl && (
                      <div className="w-32 h-36 rounded-lg overflow-hidden border border-slate-200 bg-white flex flex-col items-center justify-between p-1.5 relative group">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Back</span>
                        <img
                          src={request.backImageUrl}
                          alt="Back Design"
                          className="w-full h-24 object-contain"
                        />
                        <a
                          href={request.backImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold cursor-pointer"
                        >
                          View Full
                        </a>
                      </div>
                    )}
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
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          <button
                            onClick={() => handleDeleteRequest(request._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                          Fit: {request.neckStyle}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                          Sleeve: {request.sleeveStyle}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                          WhatsApp: {request.whatsappNumber}
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

                    {/* Completed Design Delivered (Front and/or Back) */}
                    {(request.completedFrontDesignUrl || request.completedBackDesignUrl || request.completedDesignUrl) && (
                      <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          Completed Design Delivered
                        </p>
                        <div className="flex flex-wrap gap-4 items-center">
                          {/* Front Completed */}
                          {(request.completedFrontDesignUrl || request.completedDesignUrl) && (
                            <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-indigo-100 shadow-sm">
                              <div className="w-16 h-16 rounded overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center relative group">
                                <img
                                  src={request.completedFrontDesignUrl || request.completedDesignUrl}
                                  alt="Completed Front"
                                  className="w-full h-full object-contain p-1"
                                />
                                <a
                                  href={request.completedFrontDesignUrl || request.completedDesignUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-semibold"
                                >
                                  View
                                </a>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Front View Proof</span>
                                <a
                                  href={request.completedFrontDesignUrl || request.completedDesignUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded transition-colors shadow-sm"
                                >
                                  Download Front
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Back Completed */}
                          {request.completedBackDesignUrl && (
                            <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-indigo-100 shadow-sm">
                              <div className="w-16 h-16 rounded overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center relative group">
                                <img
                                  src={request.completedBackDesignUrl}
                                  alt="Completed Back"
                                  className="w-full h-full object-contain p-1"
                                />
                                <a
                                  href={request.completedBackDesignUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-semibold"
                                >
                                  View
                                </a>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Back View Proof</span>
                                <a
                                  href={request.completedBackDesignUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded transition-colors shadow-sm"
                                >
                                  Download Back
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
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
