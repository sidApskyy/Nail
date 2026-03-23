import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import '../../styles/staff-portal.css';

export function MyAppointmentsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/staff/my-appointments')
      .then((res) => {
        setItems(res.data?.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e?.response?.data?.message || 'Failed to load appointments');
        setLoading(false);
      });
  }, []);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesSearch = searchTerm === '' || 
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  return (
    <div className="staff-portal-container">
      {/* Animated background */}
      <div className="staff-bg-animation">
        {[...Array(6)].map((_, i) => (
          <div
            key={`bg-${i}`}
            className="floating-orb"
            style={{
              width: `${100 + i * 20}px`,
              height: `${100 + i * 20}px`,
              left: `${-5 + i * 18}%`,
              top: `${-5 + i * 15}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="staff-header">
          <div className="staff-header-content">
            <div>
              <h1 className="staff-title">
                <span className="staff-title-icon">📅</span>
                My Appointments
              </h1>
              <p className="staff-subtitle">Manage all your customer appointments</p>
            </div>
            <div className="staff-stats">
              <div className="stat-card">
                <div className="stat-number">{filteredItems.length}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{items.filter(i => i.status === 'pending').length}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">Status:</label>
              <div className="filter-buttons">
                {['all', 'pending', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`filter-btn ${filter === status ? 'active' : ''}`}
                  >
                    {status === 'all' ? '📋 All' : getStatusIcon(status) + ' ' + status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="search-group">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="error-banner">
            <div className="error-icon">⚠️</div>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredItems.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-icon">📭</div>
                <h3>No appointments found</h3>
                <p>
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your filters or search terms'
                    : 'You have no appointments yet'}
                </p>
                {searchTerm || filter !== 'all' ? (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilter('all');
                    }}
                    className="secondary-button"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/staff/create-appointment')}
                    className="primary-button"
                  >
                    Create First Appointment
                  </Button>
                )}
              </div>
            ) : (
              filteredItems.map((appointment) => (
                <Card key={appointment.id} className="appointment-card">
                  <div className="appointment-card-header">
                    <div className="appointment-avatar-large">
                      {appointment.customer_name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="appointment-status-badge">
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)} {appointment.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="appointment-card-body">
                    <div className="appointment-info">
                      <h3 className="appointment-customer-name">{appointment.customer_name}</h3>
                      <div className="appointment-details-grid">
                        <div className="detail-item">
                          <span className="detail-icon">📞</span>
                          <span>{appointment.customer_phone}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <span>{String(appointment.appointment_date).slice(0, 10)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">⏰</span>
                          <span>{String(appointment.appointment_time).slice(0, 5)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {appointment.status === 'pending' && (
                      <div className="appointment-actions">
                        <Button
                          onClick={() => navigate('/staff/upload-work', { state: { appointmentId: appointment.id } })}
                          className="upload-work-btn"
                        >
                          📸 Upload Work
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
