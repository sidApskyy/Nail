import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import '../../styles/staff-portal.css';

export function StaffDashboardPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [reason, setReason] = useState('');
  const [showReasonPrompt, setShowReasonPrompt] = useState(false);

  useEffect(() => {
    api
      .get('/staff/my-appointments')
      .then((res) => {
        const all = res.data?.data || [];
        const pending = all.filter(a => a.status === 'pending');
        setAppointments(pending);
      })
      .catch(() => {});
  }, []);

  const handleCancelClick = (appointment) => {
    setCancelling(appointment);
    setReason('');
    setShowReasonPrompt(true);
  };

  const confirmCancel = async () => {
    if (!reason.trim()) {
      setError('Reason is required to cancel appointment');
      return;
    }
    try {
      await api.post('/staff/cancel-appointment', {
        appointment_id: cancelling.id,
        reason: reason.trim()
      });
      const updated = await api.get('/staff/my-appointments');
      setAppointments(updated.data?.data || []);
      setShowReasonPrompt(false);
      setCancelling(null);
      setReason('');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const cancelPrompt = showReasonPrompt && cancelling ? (
    <div className="modal-overlay">
      <div className="modal-content staff-modal">
        <div className="modal-header">
          <div className="modal-icon">⚠️</div>
          <div>
            <h3>Cancel Appointment</h3>
            <p>{cancelling.customer_name} - {String(cancelling.appointment_date).slice(0, 10)} {String(cancelling.appointment_time).slice(0, 5)}</p>
          </div>
        </div>
        <div className="modal-body">
          <label className="form-group">
            <div className="form-label">Reason for cancellation</div>
            <textarea
              className="form-textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why this appointment needs to be cancelled..."
            />
          </label>
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() => {
              setShowReasonPrompt(false);
              setCancelling(null);
              setReason('');
              setError('');
            }}
          >
            Keep Appointment
          </Button>
          <Button onClick={confirmCancel} className="danger-button">
            Cancel Appointment
          </Button>
        </div>
      </div>
    </div>
  ) : null;

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
        {/* Enhanced Header */}
        <div className="staff-header">
          <div className="staff-header-content">
            <div>
              <h1 className="staff-title">
                <span className="staff-title-icon">💅</span>
                Staff Dashboard
              </h1>
              <p className="staff-subtitle">Welcome back! Manage your appointments and work</p>
            </div>
            <div className="staff-stats">
              <div className="stat-card">
                <div className="stat-number">{appointments.length}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            onClick={() => navigate('/staff/create-appointment')}
            className="action-card primary-action"
          >
            <div className="action-icon">📝</div>
            <div className="action-content">
              <h3>Create Appointment</h3>
              <p>Add new customer booking</p>
            </div>
            <div className="action-arrow">→</div>
          </button>

          <button
            onClick={() => navigate('/staff/my-appointments')}
            className="action-card secondary-action"
          >
            <div className="action-icon">📅</div>
            <div className="action-content">
              <h3>View All</h3>
              <p>See your appointments</p>
            </div>
            <div className="action-arrow">→</div>
          </button>
        </div>

        {/* Info Cards */}
        <div className="info-grid">
          <Card className="info-card workflow-card">
            <div className="info-card-header">
              <div className="info-card-icon">🔄</div>
              <h3>Workflow Guide</h3>
            </div>
            <div className="workflow-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Create Appointment</h4>
                  <p>Add customer details and schedule</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Complete Service</h4>
                  <p>Perform the nail service</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Upload Work</h4>
                  <p>Add photos and service details</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="info-card policy-card">
            <div className="info-card-header">
              <div className="info-card-icon">📋</div>
              <h3>Access Policy</h3>
            </div>
            <div className="policy-content">
              <div className="policy-item">
                <div className="policy-icon">✅</div>
                <div>
                  <strong>Your Appointments:</strong> Full access to manage
                </div>
              </div>
              <div className="policy-item">
                <div className="policy-icon">✅</div>
                <div>
                  <strong>Upload Work:</strong> For your completed services
                </div>
              </div>
              <div className="policy-item">
                <div className="policy-icon">🔒</div>
                <div>
                  <strong>Completed Works:</strong> Admin access only
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Appointments */}
        <div className="appointments-section">
          <Card className="appointments-card">
            <div className="appointments-header">
              <div className="appointments-title">
                <h3>Recent Appointments</h3>
                <span className="appointments-count">{appointments.length} pending</span>
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            
            {appointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h4>No appointments yet</h4>
                <p>Create your first appointment to get started</p>
                <Button
                  onClick={() => navigate('/staff/create-appointment')}
                  className="primary-button"
                >
                  Create First Appointment
                </Button>
              </div>
            ) : (
              <div className="appointments-list">
                {appointments.map((a) => (
                  <div key={a.id} className="appointment-item">
                    <div className="appointment-avatar">
                      {a.customer_name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-name">{a.customer_name}</div>
                      <div className="appointment-phone">📞 {a.customer_phone}</div>
                      <div className="appointment-time">
                        📅 {String(a.appointment_date).slice(0, 10)} at {String(a.appointment_time).slice(0, 5)}
                      </div>
                    </div>
                    <div className="appointment-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/staff/upload-work', { state: { appointmentId: a.id } })}
                        className="upload-btn"
                      >
                        📸 Upload
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelClick(a)}
                        className="cancel-btn"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {cancelPrompt}
    </div>
  );
}
