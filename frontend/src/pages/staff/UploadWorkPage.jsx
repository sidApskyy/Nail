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
  const [cameraError, setCameraError] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [capturedUrl, setCapturedUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
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
      if (!image) {
        setError('Image is required');
        return;
      }

      const form = new FormData();
      form.append('appointment_id', appointmentId);
      form.append('name', name);
      form.append('number', number);
      form.append('amount', amount);
      form.append('discount_percentage', discount);
      form.append('discount_amount', ((parseFloat(amount) * parseFloat(discount)) / 100).toFixed(2));
      form.append('total', total);
      form.append('description', description);
      form.append('image', image);

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
      setCapturedUrl('');
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
        setCapturedUrl('');
      }

      const refreshed = await api.get('/staff/my-appointments');
      setAppointments(refreshed.data?.data || []);
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Failed to upload work');
    } finally {
      setSaving(false);
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      // eslint-disable-next-line no-param-reassign
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera not supported in this browser');
        return;
      }

      // Ensure any existing stream is stopped
      stopCamera();

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: cameraFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        await new Promise(r => setTimeout(r, 100));
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          const v = videoRef.current;
          const onLoaded = () => {
            v.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          const onError = () => {
            v.removeEventListener('error', onError);
            setCameraError('Failed to load camera stream');
            resolve();
          };
          v.addEventListener('loadedmetadata', onLoaded);
          v.addEventListener('error', onError);
          // Fallback timeout
          setTimeout(() => {
            v.removeEventListener('loadedmetadata', onLoaded);
            v.removeEventListener('error', onError);
            if (!v.videoWidth || !v.videoHeight) {
              setCameraError('Camera not ready. Try refreshing the page or allowing camera permission.');
            }
            resolve();
          }, 3000);
        });
        try {
          await videoRef.current.play();
        } catch (playErr) {
          setCameraError('Failed to play camera stream');
        }
      }
      setCameraOn(true);
    } catch (e) {
      setCameraError('Camera permission denied or unavailable');
    }
  };

  const flipCamera = async () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    if (cameraOn) {
      stopCamera();
      await startCamera();
    }
  };

  const capturePhoto = async () => {
    setCameraError('');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Wait up to 2 seconds for video dimensions
    let attempts = 0;
    while ((!video.videoWidth || !video.videoHeight) && attempts < 20) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError('Camera not ready. Ensure camera permission is granted and try again.');
      return;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) {
      setCameraError('Failed to capture photo');
      return;
    }

    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
    setImage(file);

    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(URL.createObjectURL(blob));

    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <span className="staff-title-icon">📸</span>
                Upload Work
              </h1>
              <p className="staff-subtitle">Complete service details and upload work photos</p>
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
                  disabled={saving || !image}
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

          {/* Image Capture Card */}
          <Card className="image-capture-card">
            <div className="capture-header">
              <div className="capture-icon">📷</div>
              <div>
                <h2>Work Photos</h2>
                <p>Capture or upload service photos</p>
              </div>
            </div>

            <div className="capture-section">
              {/* Camera Controls */}
              <div className="camera-controls">
                {!cameraOn ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="camera-btn primary"
                  >
                    <span className="btn-icon">📷</span>
                    Start Camera
                  </button>
                ) : (
                  <div className="camera-active-controls">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="camera-btn capture"
                    >
                      <span className="btn-icon">📸</span>
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={flipCamera}
                      className="camera-btn secondary"
                    >
                      <span className="btn-icon">🔄</span>
                      Flip
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="camera-btn secondary"
                    >
                      <span className="btn-icon">⏹️</span>
                      Stop
                    </button>
                  </div>
                )}
                
                {image && (
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      if (capturedUrl) {
                        URL.revokeObjectURL(capturedUrl);
                        setCapturedUrl('');
                      }
                    }}
                    className="camera-btn danger"
                  >
                    <span className="btn-icon">🗑️</span>
                    Clear Image
                  </button>
                )}
              </div>

              {/* Camera Error */}
              {cameraError && (
                <div className="camera-error">
                  <span className="error-icon">⚠️</span>
                  {cameraError}
                </div>
              )}

              {/* Camera View */}
              {cameraOn && (
                <div className="camera-view">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    controls={false}
                    disablePictureInPicture
                    className="camera-video"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="camera-overlay">
                    <div className="capture-frame"></div>
                    <div className="camera-hint">Position the work in the frame</div>
                  </div>
                </div>
              )}

              {/* Captured Image Preview */}
              {!cameraOn && capturedUrl && (
                <div className="captured-preview">
                  <div className="preview-header">
                    <h3>Captured Photo</h3>
                    <div className="preview-status success">
                      <span className="status-icon">✅</span>
                      Photo Ready
                    </div>
                  </div>
                  <div className="preview-image">
                    <img
                      src={capturedUrl}
                      alt="Captured work"
                      className="preview-img"
                    />
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="file-upload-section">
                <div className="upload-divider">
                  <span>OR</span>
                </div>
                <div className="file-upload-area">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 6 * 1024 * 1024) {
                        setError('Image size must be 6 MB or less');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        setImage(null);
                        return;
                      }
                      setImage(file);
                      if (capturedUrl) {
                        URL.revokeObjectURL(capturedUrl);
                        setCapturedUrl('');
                      }
                    }}
                    className="file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <div className="upload-icon">📁</div>
                    <div className="upload-text">
                      <h4>Choose File</h4>
                      <p>Upload image from device (max 6MB)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Image Status */}
              <div className="image-status">
                {image ? (
                  <div className="status-card success">
                    <div className="status-icon">✅</div>
                    <div>
                      <strong>Image Ready</strong>
                      <p>{image.name || 'Captured photo'} ready for upload</p>
                    </div>
                  </div>
                ) : (
                  <div className="status-card pending">
                    <div className="status-icon">📷</div>
                    <div>
                      <strong>No Image</strong>
                      <p>Capture or upload a work photo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
