import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiService } from '../../lib/mongodb';
import { CheckCircle2, XCircle, Clock, Search, Filter, MessageSquare, AlertCircle, Eye, User, FileText, Trash2 } from 'lucide-react';

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
  userId?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

export default function AdminCustomDesignsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [designs, setDesigns] = useState<CustomDesignRequest[]>([]);
  const [filteredDesigns, setFilteredDesigns] = useState<CustomDesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Modal Action State
  const [selectedDesign, setSelectedDesign] = useState<CustomDesignRequest | null>(null);
  const [modalAction, setModalAction] = useState<'accept' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDesigns();
  }, []);

  useEffect(() => {
    filterDesigns();
  }, [designs, searchTerm, statusFilter]);

  const fetchDesigns = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.adminGetCustomDesigns();
      if (response.success) {
        setDesigns(response.data);
      } else {
        setError(response.message || 'Failed to fetch custom designs');
      }
    } catch (err: any) {
      console.error('Error fetching custom designs:', err);
      setError(err.message || 'Error fetching custom design requests');
    } finally {
      setLoading(false);
    }
  };

  const filterDesigns = () => {
    let result = [...designs];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }

    // Search filter (User name, email, color, size)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          d.userId?.fullName.toLowerCase().includes(term) ||
          d.userId?.email.toLowerCase().includes(term) ||
          d.color.toLowerCase().includes(term) ||
          d.size.toLowerCase().includes(term) ||
          d.neckStyle.toLowerCase().includes(term) ||
          d.sleeveStyle.toLowerCase().includes(term)
      );
    }

    setFilteredDesigns(result);
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom design request? This will permanently remove it from the database.')) {
      return;
    }
    
    try {
      const response = await apiService.adminDeleteCustomDesign(id);
      if (response.success) {
        // Remove from local state
        setDesigns(prev => prev.filter(design => design._id !== id));
      } else {
        setError(response.message || 'Failed to delete request');
      }
    } catch (err: any) {
      console.error('Error deleting request:', err);
      setError(err.message || 'An error occurred while deleting request');
    }
  };

  const handleOpenActionModal = (design: CustomDesignRequest, action: 'accept' | 'reject') => {
    setSelectedDesign(design);
    setModalAction(action);
    setNotes(design.adminNotes || '');
  };

  const handleCloseModal = () => {
    setSelectedDesign(null);
    setModalAction(null);
    setNotes('');
  };

  const handleSubmitStatus = async () => {
    if (!selectedDesign || !modalAction) return;

    setSubmitting(true);
    setError('');

    const newStatus = modalAction === 'accept' ? 'accepted' : 'rejected';

    try {
      const response = await apiService.adminUpdateCustomDesignStatus(
        selectedDesign._id,
        newStatus,
        notes
      );

      if (response.success) {
        // Update local state
        setDesigns((prev) =>
          prev.map((d) =>
            d._id === selectedDesign._id
              ? { ...d, status: newStatus, adminNotes: notes }
              : d
          )
        );
        handleCloseModal();
      } else {
        setError(response.message || 'Failed to update custom design status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'An error occurred while updating status');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Pending
          </span>
        );
    }
  };

  return (
    <AdminLayout currentPage="custom-designs" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Custom T-Shirt Designs</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and review custom design requests uploaded by customers.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, color, style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto self-start md:self-center pb-2 md:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter By Status:
            </span>
            <div className="flex gap-1.5">
              {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all ${
                    statusFilter === status
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Custom Designs Requests Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-full border-4 border-slate-900 border-t-transparent animate-spin"></div>
            <p className="text-sm text-slate-500 font-semibold">Loading custom requests...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="text-lg font-bold text-slate-700 mb-1">No requests found</p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              No custom shirt design requests match the current search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDesigns.map((design) => (
              <div
                key={design._id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                {/* Upper Section */}
                <div className="p-5 space-y-4">
                  {/* Title Bar: User & Status */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                          {design.userId?.fullName || 'Deleted User'}
                        </h2>
                        <span className="text-xs text-slate-500">{design.userId?.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(design.status)}
                      <button
                        onClick={() => handleDeleteRequest(design._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Grid: Image + Specifications */}
                  <div className="flex gap-4">
                    {/* Design Image Thumbnail */}
                    <div className="w-32 h-32 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 flex-shrink-0 relative group">
                      <img
                        src={design.imageUrl}
                        alt="Design Thumbnail"
                        className="w-full h-full object-contain p-1"
                      />
                      <a
                        href={design.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Image
                      </a>
                    </div>

                    {/* Specifications List */}
                    <div className="flex-1 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full border border-slate-300" style={{ backgroundColor: design.color }} />
                        <span className="font-bold text-slate-800">Color:</span> {design.color}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Size:</span> {design.size}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Neck:</span> {design.neckStyle}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Sleeve:</span> {design.sleeveStyle}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Date:</span> {new Date(design.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Other Specifications Details */}
                  {design.otherDetails && (
                    <div className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700 flex gap-2">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 mb-0.5">Instructions:</p>
                        {design.otherDetails}
                      </div>
                    </div>
                  )}

                  {/* Admin notes (if processed) */}
                  {design.adminNotes && (
                    <div className={`p-3 rounded-lg text-xs leading-relaxed border flex gap-2 ${
                      design.status === 'accepted'
                        ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800'
                        : 'bg-rose-50/40 border-rose-100 text-rose-800'
                    }`}>
                      <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold uppercase tracking-wider mb-0.5 text-[10px]">Admin Notes:</p>
                        {design.adminNotes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons (Action Bar if Pending) */}
                {design.status === 'pending' && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleOpenActionModal(design, 'accept')}
                      className="py-2 px-3 text-xs font-bold text-center border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleOpenActionModal(design, 'reject')}
                      className="py-2 px-3 text-xs font-bold text-center border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Accept / Reject Notes Prompt */}
        {selectedDesign && modalAction && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  {modalAction === 'accept' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Accept Request & Add Notes
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      Reject Request & Add Notes
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Provide custom instructions, pricing adjustments, delivery expectations, or rejection details to be shown on the customer's dashboard.
                </p>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type notes for the user here... (e.g. 'Order confirmed. Delivery within 7 business days.' or 'The upload resolution is too low. Please upload a clear image.')"
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm leading-relaxed mb-4"
                />

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitStatus}
                    disabled={submitting}
                    className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 ${
                      modalAction === 'accept'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Confirm Response'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
