import { useState, useEffect } from 'react';
import { apiService } from '../../lib/mongodb';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Trash2, Upload, Image as ImageIcon, ExternalLink, Loader2 } from 'lucide-react';

export interface HeroSlideItem {
  _id?: string;
  desktopImage: string;
  mobileImage: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface Settings {
  gstPercentage: number;
  gstEnabled: boolean;
  shippingFee: number;
  shippingEnabled: boolean;
  freeShippingAbove: number;
  heroSlides?: HeroSlideItem[];
  heroBannerDesktop?: string;
  heroBannerMobile?: string;
  heroBanner2Desktop?: string;
  heroBanner2Mobile?: string;
  heroBanner3Desktop?: string;
  heroBanner3Mobile?: string;
  heroBanner4Desktop?: string;
  heroBanner4Mobile?: string;
  heroBanner5Desktop?: string;
  heroBanner5Mobile?: string;
  announcementText?: string;
}

export default function AdminSettingsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [resetOptions, setResetOptions] = useState({
    products: false,
    orders: false,
    users: false,
    reviews: false,
    all: false
  });
  const [settings, setSettings] = useState<Settings>({
    gstPercentage: 18,
    gstEnabled: true,
    shippingFee: 0,
    shippingEnabled: true,
    freeShippingAbove: 999,
    heroSlides: [],
    heroBannerDesktop: '',
    heroBannerMobile: '',
    heroBanner2Desktop: '',
    heroBanner2Mobile: '',
    heroBanner3Desktop: '',
    heroBanner3Mobile: '',
    heroBanner4Desktop: '',
    heroBanner4Mobile: '',
    heroBanner5Desktop: '',
    heroBanner5Mobile: '',
    announcementText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingSlide, setUploadingSlide] = useState<{ index: number; type: 'desktop' | 'mobile' } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await apiService.getSettings();
      if (result.success && result.data) {
        const loaded = result.data;
        // If heroSlides is not populated, check if legacy fields exist with custom images
        let initialSlides: HeroSlideItem[] = Array.isArray(loaded.heroSlides) ? loaded.heroSlides : [];
        if (initialSlides.length === 0) {
          const legacyItems = [
            { desktop: loaded.heroBannerDesktop, mobile: loaded.heroBannerMobile },
            { desktop: loaded.heroBanner2Desktop, mobile: loaded.heroBanner2Mobile },
            { desktop: loaded.heroBanner3Desktop, mobile: loaded.heroBanner3Mobile },
            { desktop: loaded.heroBanner4Desktop, mobile: loaded.heroBanner4Mobile },
            { desktop: loaded.heroBanner5Desktop, mobile: loaded.heroBanner5Mobile }
          ];
          legacyItems.forEach((item, idx) => {
            if (item.desktop && item.desktop.trim() && !item.desktop.includes('/hero-banner.webp')) {
              initialSlides.push({
                desktopImage: item.desktop.trim(),
                mobileImage: item.mobile?.trim() || item.desktop.trim(),
                badge: idx === 0 ? 'ASTROS KULTURE' : `DROP #${idx + 1}`,
                title: idx === 0 ? 'Streetwear From Another Universe' : 'Exclusive Streetwear Drop',
                subtitle: 'Step into Astros - where oversized meets attitude. High quality cotton, bold graphics, and clean fits built for everyday comfort.',
                buttonText: 'Shop Now',
                buttonLink: 'shop'
              });
            }
          });
        }
        setSettings({
          ...loaded,
          heroSlides: initialSlides.slice(0, 5)
        });
      } else {
        throw new Error(result.message || 'Failed to load settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const inputElement = e.target as HTMLInputElement;

    if (type === 'number') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setSettings(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? inputElement.checked : value
      }));
    }
  };

  const handleResetOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === 'all') {
      setResetOptions({
        products: checked,
        orders: checked,
        users: checked,
        reviews: checked,
        all: checked
      });
    } else {
      setResetOptions(prev => ({
        ...prev,
        [name]: checked,
        all: checked && prev.products && prev.orders && prev.users && prev.reviews
      }));
    }
  };

  const handleMasterReset = async () => {
    if (!resetOptions.products && !resetOptions.orders && !resetOptions.users && !resetOptions.reviews) {
      setError('Please select at least one item to reset');
      return;
    }

    if (!confirm('WARNING: This will PERMANENTLY DELETE the selected data. This action cannot be undone. Are you sure?')) {
      return;
    }

    try {
      setSaving(true);
      const result = await apiService.request('/admin/reset-db', {
        method: 'POST',
        body: JSON.stringify(resetOptions)
      }, true);

      if (result.success) {
        setSuccess('Data reset successfully');
        if (resetOptions.users || resetOptions.all) {
          setTimeout(() => onNavigate('login'), 2000);
        }
      } else {
        throw new Error(result.message || 'Reset failed');
      }
    } catch (err) {
      setError('Failed to reset data: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  // Hero Slide Operations (Max 5)
  const addHeroSlide = () => {
    const current = settings.heroSlides || [];
    if (current.length >= 5) {
      alert('Maximum 5 hero slides allowed');
      return;
    }
    const newSlide: HeroSlideItem = {
      desktopImage: '',
      mobileImage: '',
      badge: current.length === 0 ? 'ASTROS KULTURE' : `DROP #${current.length + 1}`,
      title: 'Streetwear From Another Universe',
      subtitle: 'Step into Astros - where oversized meets attitude. High quality cotton, bold graphics, and clean fits built for everyday comfort.',
      buttonText: 'Shop Now',
      buttonLink: 'shop'
    };
    setSettings(prev => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide]
    }));
  };

  const removeHeroSlide = (index: number) => {
    setSettings(prev => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).filter((_, i) => i !== index)
    }));
  };

  const updateSlideField = (index: number, field: keyof HeroSlideItem, value: string) => {
    setSettings(prev => {
      const slides = [...(prev.heroSlides || [])];
      slides[index] = { ...slides[index], [field]: value };
      return { ...prev, heroSlides: slides };
    });
  };

  const handleImageFileUpload = async (index: number, type: 'desktop' | 'mobile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSlide({ index, type });
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const res = await fetch('/api/settings/upload-hero', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        updateSlideField(index, type === 'desktop' ? 'desktopImage' : 'mobileImage', data.url);
      } else {
        alert(data.message || 'Failed to upload hero image');
      }
    } catch (err: any) {
      alert('Upload error: ' + (err.message || 'Network error'));
    } finally {
      setUploadingSlide(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const slides = (settings.heroSlides || []).slice(0, 5);
      const payload: any = {
        ...settings,
        heroSlides: slides,
        heroBannerDesktop: slides[0]?.desktopImage || '',
        heroBannerMobile: slides[0]?.mobileImage || '',
        heroBanner2Desktop: slides[1]?.desktopImage || '',
        heroBanner2Mobile: slides[1]?.mobileImage || '',
        heroBanner3Desktop: slides[2]?.desktopImage || '',
        heroBanner3Mobile: slides[2]?.mobileImage || '',
        heroBanner4Desktop: slides[3]?.desktopImage || '',
        heroBanner4Mobile: slides[3]?.mobileImage || '',
        heroBanner5Desktop: slides[4]?.desktopImage || '',
        heroBanner5Mobile: slides[4]?.mobileImage || ''
      };

      const result = await apiService.updateSettings(payload);
      if (result.success) {
        setSuccess('Settings & Hero Banner slides saved successfully!');
        await loadSettings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to update settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const currentSlides = settings.heroSlides || [];

  return (
    <AdminLayout currentPage="settings" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Settings & Appearance</h1>
          <p className="text-gray-600 mt-2">Manage Hero Carousel (Max 5 images), Top Announcement Ticker, and Shipping / GST.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Hero Section Carousel - Max 5 */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-red-600" />
                  Hero Section Carousel ({currentSlides.length}/5 Slides)
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Upload up to 5 custom hero images. If no images are added, the store will display the default Astros hero banner.
                </p>
              </div>
              <button
                type="button"
                onClick={addHeroSlide}
                disabled={currentSlides.length >= 5}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                  currentSlides.length >= 5
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            {currentSlides.length === 0 ? (
              <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  No custom hero images added
                </p>
                <p className="text-xs text-amber-700 mb-4">
                  The storefront is currently showing the hardcoded default hero banner (<code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">/hero-banner.webp</code>). Click &quot;Add Hero Slide&quot; above to upload your custom hero slides.
                </p>
                <button
                  type="button"
                  onClick={addHeroSlide}
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add First Hero Slide
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {currentSlides.map((slide, index) => {
                  const isUploadingDesktop = uploadingSlide?.index === index && uploadingSlide?.type === 'desktop';
                  const isUploadingMobile = uploadingSlide?.index === index && uploadingSlide?.type === 'mobile';

                  return (
                    <div key={index} className="p-5 bg-gray-50/80 rounded-xl border border-gray-200 relative">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
                        <span className="text-sm font-black text-gray-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          Slide #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeHeroSlide(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Desktop Image */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Desktop Image URL (1200x520) <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.desktopImage}
                              onChange={(e) => updateSlideField(index, 'desktopImage', e.target.value)}
                              placeholder="https://... or click Upload"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs"
                              required
                            />
                            <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors">
                              {isUploadingDesktop ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploadingDesktop}
                                onChange={(e) => handleImageFileUpload(index, 'desktop', e)}
                              />
                            </label>
                          </div>
                          {slide.desktopImage && (
                            <div className="mt-2 h-20 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-900 relative">
                              <img
                                src={slide.desktopImage}
                                alt="Desktop Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/hero-banner.webp';
                                }}
                              />
                              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                Desktop Preview
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Mobile Image */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Mobile Image URL (Optional, uses Desktop if empty)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={slide.mobileImage}
                              onChange={(e) => updateSlideField(index, 'mobileImage', e.target.value)}
                              placeholder="Leave blank to use desktop image"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs"
                            />
                            <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors">
                              {isUploadingMobile ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploadingMobile}
                                onChange={(e) => handleImageFileUpload(index, 'mobile', e)}
                              />
                            </label>
                          </div>
                          {slide.mobileImage && (
                            <div className="mt-2 h-20 w-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-900 relative">
                              <img
                                src={slide.mobileImage}
                                alt="Mobile Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/hero-banner-mobile.webp';
                                }}
                              />
                              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                Mobile Preview
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Text & Link Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Badge
                          </label>
                          <input
                            type="text"
                            value={slide.badge || ''}
                            onChange={(e) => updateSlideField(index, 'badge', e.target.value)}
                            placeholder="ASTROS KULTURE"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Heading / Title
                          </label>
                          <input
                            type="text"
                            value={slide.title || ''}
                            onChange={(e) => updateSlideField(index, 'title', e.target.value)}
                            placeholder="Streetwear From Another Universe"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={slide.buttonText || ''}
                            onChange={(e) => updateSlideField(index, 'buttonText', e.target.value)}
                            placeholder="Shop Now"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">
                            Button Link
                          </label>
                          <input
                            type="text"
                            value={slide.buttonLink || ''}
                            onChange={(e) => updateSlideField(index, 'buttonLink', e.target.value)}
                            placeholder="shop"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Announcement Ticker Settings - Controlled strictly by admin, NO HARDCODED BANNERS */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                Top Announcement Ticker (Above Header)
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('banners')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                <span>Manage Banners</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Enter announcement ticker text below. <strong>No hardcoded banners are displayed</strong>; if this is left empty and no active banners exist in Banners Manager, the banner bar is completely hidden.
            </p>

            <div>
              <label htmlFor="announcementText" className="block text-xs font-bold text-gray-700 mb-1.5">
                Announcement Message
              </label>
              <input
                type="text"
                id="announcementText"
                name="announcementText"
                value={settings.announcementText || ''}
                onChange={handleInputChange}
                placeholder="Leave blank to hide banner, or enter your announcement text..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Tip: You can also create multiple promotional discount banners from the <button type="button" onClick={() => onNavigate('banners')} className="text-blue-600 underline font-semibold">Banners Page</button> which will automatically rotate in the top marquee ticker.
              </p>
            </div>
          </div>

          {/* GST Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">GST Settings</h2>

            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="gstEnabled"
                name="gstEnabled"
                checked={settings.gstEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="gstEnabled" className="ml-3 text-sm font-medium text-gray-700">
                Enable GST
              </label>
            </div>

            {settings.gstEnabled && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="gstPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    GST Percentage (%)
                  </label>
                  <input
                    type="number"
                    id="gstPercentage"
                    name="gstPercentage"
                    value={settings.gstPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default GST percentage applied to all products</p>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Fee Settings</h2>

            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="shippingEnabled"
                name="shippingEnabled"
                checked={settings.shippingEnabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="shippingEnabled" className="ml-3 text-sm font-medium text-gray-700">
                Enable Shipping Fees
              </label>
            </div>

            {settings.shippingEnabled && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700 mb-2">
                    Default Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="shippingFee"
                    name="shippingFee"
                    value={settings.shippingFee}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default shipping fee applied to orders</p>
                </div>

                <div>
                  <label htmlFor="freeShippingAbove" className="block text-sm font-medium text-gray-700 mb-2">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    id="freeShippingAbove"
                    name="freeShippingAbove"
                    value={settings.freeShippingAbove}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Orders above this amount will have free shipping</p>
                </div>
              </div>
            )}
          </div>

          {/* Dangerous Zone - Master Reset */}
          <div className="mb-8 border-t border-red-200 pt-8 mt-12">
            <h2 className="text-xl font-bold text-red-600 mb-2">Dangerous Zone</h2>
            <p className="text-gray-600 mb-4">Actions here can cause permanent data loss. Use with extreme caution.</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-4">Master Data Reset</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="all" checked={resetOptions.all} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="orders" checked={resetOptions.orders} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Orders & Revenue</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="users" checked={resetOptions.users} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Users & Accounts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="products" checked={resetOptions.products} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Products & Images</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="reviews" checked={resetOptions.reviews} onChange={handleResetOptionChange} className="rounded text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Reviews</span>
                </label>
              </div>
              <button
                type="button"
                onClick={handleMasterReset}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Clear Selected Data
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold transition-all shadow-md text-sm"
            >
              {saving ? 'Saving Changes...' : 'Save Settings & Appearance'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
