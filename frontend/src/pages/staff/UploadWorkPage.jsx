import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import '../../styles/staff-portal.css';

export function UploadWorkPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [total, setTotal] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    api
      .get('/staff/my-appointments')
      .then((res) => {
        const all = res.data?.data || [];
        setAppointments(all);
        // Auto-select appointment if passed via state or URL params
        const appointmentIdFromState = location.state?.appointmentId;
        const appointmentIdFromUrl = searchParams.get('appointment');
        const selectedAppointmentId = appointmentIdFromState || appointmentIdFromUrl;
        if (selectedAppointmentId) {
          setAppointmentId(selectedAppointmentId);
          
          // Auto-fill customer details from selected appointment
          const selectedAppointment = all.find(a => a.id === selectedAppointmentId);
          if (selectedAppointment) {
            setName(selectedAppointment.customer_name || '');
            setNumber(selectedAppointment.customer_phone || '');
          }
        }
      })
      .catch(() => {});
  }, [location.state?.appointmentId, searchParams]);

  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    const discPercentage = parseFloat(discount) || 0;
    
    // Calculate discount amount from percentage
    const discountAmount = (amt * discPercentage) / 100;
    const totalAmt = Math.max(0, amt - discountAmount);
    
    setTotal(totalAmt.toFixed(2));
    
    // Update discount if percentage exceeds 100
    if (discPercentage > 100) {
      setDiscount('100');
    }
  }, [amount, discount]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Validate number: exactly 10 digits
    if (!/^\d{10}$/.test(number)) {
      setError('Number must be exactly 10 digits');
      setSaving(false);
      return;
    }

    // Validate amount and discount
    const amt = parseFloat(amount) || 0;
    const discPercentage = parseFloat(discount) || 0;
    
    if (amt < 0) {
      setError('Amount cannot be negative');
      setSaving(false);
      return;
    }
    
    if (discPercentage < 0) {
      setError('Discount percentage cannot be negative');
      setSaving(false);
      return;
    }
    
    if (discPercentage > 100) {
      setError('Discount percentage cannot exceed 100%');
      setSaving(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('appointment_id', appointmentId);
      form.append('name', name);
      form.append('number', number);
      form.append('amount', amount);
      form.append('discount_percentage', discount);
      form.append('discount_amount', ((parseFloat(amount) * parseFloat(discount)) / 100).toFixed(2));
      form.append('total', total);
      form.append('description', description);
      
      // Only append image if it exists
      if (image) {
        form.append('image', image);
      }

      await api.post('/staff/upload-work', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Work uploaded. Appointment marked as completed.');
      setAppointmentId('');
      setName('');
      setNumber('');
      setAmount('');
      setDiscount('');
      setTotal('');
      setDescription('');
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      const refreshed = await api.get('/staff/my-appointments');
      setAppointments(refreshed.data?.data || []);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to upload work');
    } finally {
      setSaving(false);
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
                <span className="staff-title-icon">📸</span>
                Upload Work
              </h1>
              <p className="staff-subtitle">Complete service details and upload work information</p>
            </div>
          </div>
        </div>

        <div className="upload-work-grid">
          {/* Main Form Card */}
          <Card className="upload-form-card">
            <div className="form-header">
              <div className="form-header-icon">💅</div>
              <div>
                <h2>Service Details</h2>
                <p>Enter the completed service information</p>
              </div>
            </div>

            <form className="upload-form" onSubmit={onSubmit}>
              <div className="form-section">
                <h3 className="section-title">📋 Appointment Information</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📅</span>
                    Select Appointment *
                  </label>
                  <select
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                    className="form-input"
                    disabled={saving}
                  >
                    <option value="">Choose an appointment</option>
                    {appointments.filter(a => a.status === 'pending').map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.customer_name} - {String(a.appointment_date).slice(0, 10)} at {String(a.appointment_time).slice(0, 5)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👤</span>
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter customer name"
                      className="form-input"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📞</span>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={number}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNumber(val);
                        if (/^\d{10}$/.test(val)) {
                          setError('');
                        }
                      }}
                      placeholder="1234567890"
                      className="form-input"
                      disabled={saving}
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">💰 Pricing Details</h3>
                
                <div className="pricing-grid">
                  <div className="pricing-input-group">
                    <label className="form-label">
                      <span className="label-icon">💵</span>
                      Service Amount *
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (parseFloat(val) >= 0 && /^\d*\.?\d{0,2}$/.test(val))) {
                          setAmount(val);
                        }
                      }}
                      placeholder="0.00"
                      className="form-input"
                      disabled={saving}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="pricing-input-group">
                    <label className="form-label">
                      <span className="label-icon">🏷️</span>
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 100 && /^\d*\.?\d{0,2}$/.test(val))) {
                          setDiscount(val);
                        }
                      }}
                      placeholder="0.00"
                      className="form-input"
                      disabled={saving}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="pricing-summary">
                  <div className="summary-item">
                    <span>Service Amount:</span>
                    <span className="amount">₹{amount || '0.00'}</span>
                  </div>
                  <div className="summary-item discount">
                    <span>Discount ({discount || 0}%):</span>
                    <span className="amount">-₹{amount && discount ? ((parseFloat(amount) * parseFloat(discount)) / 100).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="summary-item total">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-amount">₹{total || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">📝 Additional Notes</h3>
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📄</span>
                    Service Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the services performed..."
                    className="form-textarea"
                    disabled={saving}
                    rows={4}
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="form-error-banner">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="form-success-banner">
                  <span className="success-icon">🎉</span>
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <div className="form-actions">
                <Button
                  type="submit"
                  disabled={saving}
                  className="submit-button upload-submit-btn"
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Uploading Work...
                    </>
                  ) : (
                    <>
                      <span className="button-icon">📸</span>
                      Upload Work
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
