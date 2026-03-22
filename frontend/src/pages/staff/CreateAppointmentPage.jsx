import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import '../../styles/staff-portal.css';

export function CreateAppointmentPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  // Get available time slots
  const availableTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    // Set default date to today
    setAppointmentDate(today);
  }, [today]);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch(name) {
      case 'customerName':
        if (!value.trim()) {
          errors.customerName = 'Customer name is required';
        } else if (value.trim().length < 2) {
          errors.customerName = 'Name must be at least 2 characters';
        } else {
          delete errors.customerName;
        }
        break;
        
      case 'customerPhone':
        const phoneRegex = /^\d{10}$/;
        if (!value) {
          errors.customerPhone = 'Phone number is required';
        } else if (!phoneRegex.test(value)) {
          errors.customerPhone = 'Phone must be exactly 10 digits';
        } else {
          delete errors.customerPhone;
        }
        break;
        
      case 'appointmentDate':
        if (!value) {
          errors.appointmentDate = 'Date is required';
        } else if (new Date(value) < new Date(today)) {
          errors.appointmentDate = 'Date cannot be in the past';
        } else {
          delete errors.appointmentDate;
        }
        break;
        
      case 'appointmentTime':
        if (!value) {
          errors.appointmentTime = 'Time is required';
        } else {
          delete errors.appointmentTime;
        }
        break;
        
      default:
        break;
    }
    
    return errors;
  };

  const handleFieldChange = (name, value) => {
    // Clear previous errors and success messages
    setError('');
    setSuccess('');
    
    // Update field value
    switch(name) {
      case 'customerName':
        setCustomerName(value);
        break;
      case 'customerPhone':
        const phoneValue = value.replace(/\D/g, '').slice(0, 10);
        setCustomerPhone(phoneValue);
        value = phoneValue;
        break;
      case 'appointmentDate':
        setAppointmentDate(value);
        break;
      case 'appointmentTime':
        setAppointmentTime(value);
        break;
      default:
        break;
    }
    
    // Validate field if it has been touched
    if (touched[name]) {
      setFieldErrors(validateField(name, value));
    }
  };

  const handleFieldBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    
    let value;
    switch(name) {
      case 'customerName':
        value = customerName;
        break;
      case 'customerPhone':
        value = customerPhone;
        break;
      case 'appointmentDate':
        value = appointmentDate;
        break;
      case 'appointmentTime':
        value = appointmentTime;
        break;
      default:
        value = '';
    }
    
    setFieldErrors(validateField(name, value));
  };

  const validateForm = () => {
    const errors = {
      ...validateField('customerName', customerName),
      ...validateField('customerPhone', customerPhone),
      ...validateField('appointmentDate', appointmentDate),
      ...validateField('appointmentTime', appointmentTime)
    };
    
    setFieldErrors(errors);
    setTouched({
      customerName: true,
      customerPhone: true,
      appointmentDate: true,
      appointmentTime: true
    });
    
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }
    
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.post('/staff/appointments', {
        customer_name: customerName.trim(),
        customer_phone: customerPhone,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime
      });
      
      setSuccess('Appointment created successfully! 🎉');
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setAppointmentDate(today);
      setAppointmentTime('');
      setFieldErrors({});
      setTouched({});
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create appointment');
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
                <span className="staff-title-icon">📝</span>
                Create Appointment
              </h1>
              <p className="staff-subtitle">Add a new customer appointment</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="create-appointment-card">
          <div className="form-header">
            <div className="form-header-icon">👤</div>
            <div>
              <h2>Customer Information</h2>
              <p>Enter the customer details for the appointment</p>
            </div>
          </div>

          <form className="appointment-form" onSubmit={onSubmit}>
            <div className="form-grid">
              {/* Customer Name */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">👤</span>
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => handleFieldChange('customerName', e.target.value)}
                  onBlur={() => handleFieldBlur('customerName')}
                  placeholder="Enter customer name"
                  className={`form-input ${fieldErrors.customerName ? 'error' : ''} ${touched.customerName && !fieldErrors.customerName ? 'success' : ''}`}
                  disabled={saving}
                />
                {fieldErrors.customerName && (
                  <div className="field-error">
                    <span className="error-icon">⚠️</span>
                    {fieldErrors.customerName}
                  </div>
                )}
                {touched.customerName && !fieldErrors.customerName && customerName && (
                  <div className="field-success">
                    <span className="success-icon">✅</span>
                    Looks good!
                  </div>
                )}
              </div>

              {/* Customer Phone */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📞</span>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                  onBlur={() => handleFieldBlur('customerPhone')}
                  placeholder="1234567890"
                  className={`form-input ${fieldErrors.customerPhone ? 'error' : ''} ${touched.customerPhone && !fieldErrors.customerPhone ? 'success' : ''}`}
                  disabled={saving}
                  maxLength={10}
                />
                {fieldErrors.customerPhone && (
                  <div className="field-error">
                    <span className="error-icon">⚠️</span>
                    {fieldErrors.customerPhone}
                  </div>
                )}
                {touched.customerPhone && !fieldErrors.customerPhone && customerPhone.length === 10 && (
                  <div className="field-success">
                    <span className="success-icon">✅</span>
                    Valid phone number
                  </div>
                )}
              </div>

              {/* Appointment Date */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📅</span>
                  Appointment Date *
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => handleFieldChange('appointmentDate', e.target.value)}
                  onBlur={() => handleFieldBlur('appointmentDate')}
                  min={today}
                  className={`form-input ${fieldErrors.appointmentDate ? 'error' : ''} ${touched.appointmentDate && !fieldErrors.appointmentDate ? 'success' : ''}`}
                  disabled={saving}
                />
                {fieldErrors.appointmentDate && (
                  <div className="field-error">
                    <span className="error-icon">⚠️</span>
                    {fieldErrors.appointmentDate}
                  </div>
                )}
                {touched.appointmentDate && !fieldErrors.appointmentDate && appointmentDate && (
                  <div className="field-success">
                    <span className="success-icon">✅</span>
                    Date selected
                  </div>
                )}
              </div>

              {/* Appointment Time */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">⏰</span>
                  Appointment Time *
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => handleFieldChange('appointmentTime', e.target.value)}
                  onBlur={() => handleFieldBlur('appointmentTime')}
                  className={`form-input ${fieldErrors.appointmentTime ? 'error' : ''} ${touched.appointmentTime && !fieldErrors.appointmentTime ? 'success' : ''}`}
                  disabled={saving}
                >
                  <option value="">Select a time</option>
                  {availableTimeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {fieldErrors.appointmentTime && (
                  <div className="field-error">
                    <span className="error-icon">⚠️</span>
                    {fieldErrors.appointmentTime}
                  </div>
                )}
                {touched.appointmentTime && !fieldErrors.appointmentTime && appointmentTime && (
                  <div className="field-success">
                    <span className="success-icon">✅</span>
                    Time selected
                  </div>
                )}
              </div>
            </div>

            {/* Form Messages */}
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
                className="submit-button"
              >
                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating Appointment...
                  </>
                ) : (
                  <>
                    <span className="button-icon">✨</span>
                    Create Appointment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Quick Tips */}
        <Card className="tips-card">
          <div className="tips-header">
            <div className="tips-icon">💡</div>
            <h3>Quick Tips</h3>
          </div>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">📝</span>
              <div>
                <strong>Double-check details:</strong> Ensure customer name and phone are accurate
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📅</span>
              <div>
                <strong>Future dates only:</strong> Appointments cannot be scheduled for past dates
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⏰</span>
              <div>
                <strong>Available slots:</strong> Choose from pre-defined time slots for better scheduling
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📞</span>
              <div>
                <strong>Phone format:</strong> Enter exactly 10 digits without spaces or dashes
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
