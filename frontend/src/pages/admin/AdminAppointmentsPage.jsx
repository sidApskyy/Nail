import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { TableSkeleton } from '../../components/Skeleton';
import { EmptyState } from '../../components/EmptyState';

export function AdminAppointmentsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/appointments')
      .then((res) => {
        setItems(res.data?.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.response?.data?.message || 'Failed to load appointments');
        setLoading(false);
      });
  }, []);

  const handleExportAndDelete = async () => {
    if (items.length === 0) {
      alert('No appointments to export');
      return;
    }

    setIsExporting(true);
    
    try {
      // Export to Excel
      const response = await api.get('/admin/appointments/export', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Delete data from database after successful download
      await api.delete('/admin/appointments/clear');
      
      // Refresh the data
      const res = await api.get('/admin/appointments');
      setItems(res.data?.data || []);
      
      alert('Appointments exported successfully and cleared from database!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export appointments. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <div className="page-title">Appointments</div>
          <div className="page-subtitle">All appointments across staff</div>
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

      {error ? <div className="mb-4 text-sm text-rose-600 animate-pulse-once">{error}</div> : null}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <EmptyState
          title="Error Loading Appointments"
          description={error}
        />
      ) : !items.length ? (
        <EmptyState
          title="No Appointments Found"
          description="There are no appointments in the system yet."
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Staff</th>
                <th>Cancellation Reason</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.customer_name}</td>
                  <td className="text-slate-600">{a.customer_phone}</td>
                  <td>{String(a.appointment_date).slice(0, 10)}</td>
                  <td>{String(a.appointment_time).slice(0, 5)}</td>
                  <td>
                    <span className={`status-badge status-${a.status}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="text-slate-600">{a.staff_name}</td>
                  <td className="text-slate-600">{a.status === 'cancelled' ? a.cancellation_reason || '-' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
