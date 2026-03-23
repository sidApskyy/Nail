import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/Card';

export function CompletedWorksPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [selectedWork, setSelectedWork] = useState(null);
  const [activeImageUrl, setActiveImageUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  console.log('Current selectedWork:', selectedWork);

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    // Fallback to test route for debugging
    if (imageUrl.includes('1774286972658_image00007.jpeg')) {
      return `${base}/test-image`;
    }
    
    return `${base}${imageUrl}`;
  };

  useEffect(() => {
    api
      .get('/admin/completed-works')
      .then((res) => setItems(res.data?.data || []))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load completed works'));
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveImageUrl('');
        setSelectedWork(null);
      }
    };

    if (activeImageUrl || selectedWork) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
    return undefined;
  }, [activeImageUrl, selectedWork]);

  const handleCardClick = (work) => {
    console.log('Card clicked:', work);
    setSelectedWork(work);
  };

  const handleExportAndDelete = async () => {
    if (items.length === 0) {
      alert('No data to export');
      return;
    }

    setIsExporting(true);
    
    try {
      // Export to Excel
      const response = await api.get('/admin/completed-works/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `completed-works-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Delete data from database after successful download
      await api.delete('/admin/completed-works/clear');
      
      // Refresh the data
      const res = await api.get('/admin/completed-works');
      setItems(res.data?.data || []);
      
      alert('Data exported successfully and cleared from database!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <div className="text-xl font-bold">Completed Works</div>
          <div className="text-sm text-slate-600">Click on customer for detailed view</div>
        </div>
        <button
          onClick={handleExportAndDelete}
          disabled={isExporting || items.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export & Clear</span>
            </>
          )}
        </button>
      </div>

      {error ? <div className="mb-4 text-sm text-rose-600">{error}</div> : null}

      {/* Brief View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {items.map((w) => (
          <Card 
            key={w.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCardClick(w)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-slate-900">{w.customer_name}</div>
                <div className="text-sm text-slate-600">{w.customer_phone}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Staff</div>
                <div className="text-sm font-medium text-blue-600">{w.uploaded_by_name}</div>
              </div>
            </div>
            
            <div className="text-xs text-slate-500">Total Amount</div>
            <div className="text-lg font-bold text-slate-900">₹{w.total || 0}</div>
          </Card>
        ))}
      </div>

      {/* Detailed Modal */}
      {selectedWork && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedWork(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900">Work Details</h3>
                <button
                  onClick={() => setSelectedWork(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500">Name:</span>
                      <p className="font-medium">{selectedWork.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Phone:</span>
                      <p className="font-medium">{selectedWork.customer_phone}</p>
                    </div>
                  </div>
                </div>

                {/* Staff Info */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Staff Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500">Staff Name:</span>
                      <p className="font-medium text-blue-600">{selectedWork.uploaded_by_name}</p>
                    </div>
                    {selectedWork.uploaded_by_email && (
                      <div>
                        <span className="text-xs text-slate-500">Email:</span>
                        <p className="font-medium">{selectedWork.uploaded_by_email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Details */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Work Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500">Service Name:</span>
                      <p className="font-medium">{selectedWork.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Service Number:</span>
                      <p className="font-medium">{selectedWork.number || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Description:</span>
                      <p className="font-medium whitespace-pre-wrap">{selectedWork.description || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Pricing Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500">Amount:</span>
                      <p className="font-medium">₹{selectedWork.amount || 0}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Discount:</span>
                      <p className="font-medium">{selectedWork.discount_percentage || 0}% (₹{selectedWork.discount_amount || 0})</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Total:</span>
                      <p className="font-bold text-lg text-green-600">₹{selectedWork.total || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Image */}
              {selectedWork.image_url && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Work Image</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={resolveImageUrl(selectedWork.image_url)}
                      alt="Completed work"
                      className="w-full h-64 object-cover cursor-pointer"
                      onClick={() => setActiveImageUrl(resolveImageUrl(selectedWork.image_url))}
                    />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Work ID: {selectedWork.id}</span>
                  <span>Completed: {new Date(selectedWork.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {activeImageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto"
          onClick={() => setActiveImageUrl('')}
        >
          <div 
            className="relative min-w-0 min-h-0 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImageUrl}
              alt="Work detail"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setActiveImageUrl('')}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

       {!items.length && !error ? <div className="text-sm text-slate-600">No completed works found.</div> : null}
    </div>
  );
}