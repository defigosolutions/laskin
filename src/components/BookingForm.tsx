import React, { useState, useEffect } from 'react';
import { 
  usePublicTreatments, 
  usePublicPackages, 
  usePublicBranches, 
  useAvailability, 
  useCreateBooking 
} from '../hooks/usePublicApi';

export default function BookingForm({ isModal = false, onClose = () => {}, defaultTreatmentId = "" }) {
  const [formData, setFormData] = useState({
    treatmentId: defaultTreatmentId,
    packageId: '',
    branchId: '',
    date: '',
    startTime: '',
    name: '',
    email: '',
    phone: '',
    concerns: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Data Queries
  const { data: treatments = [] } = usePublicTreatments();
  const { data: packages = [] } = usePublicPackages();
  const { data: branches = [] } = usePublicBranches();

  // Automatically select the single branch when branches load
  useEffect(() => {
    if (branches && branches.length > 0 && !formData.branchId) {
      setFormData(prev => ({ ...prev, branchId: branches[0].id }));
    }
  }, [branches]);

  // Fetch availability when branch and date are selected
  const { data: timeSlots = [], isLoading: loadingAvailability } = useAvailability({
    branchId: formData.branchId,
    date: formData.date
  });

  const createBookingMutation = useCreateBooking();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.treatmentId && !formData.packageId) {
      newErrors.service = "Please select a treatment or package";
    }
    if (!formData.date) {
      newErrors.date = "Please select an appointment date";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Please select a time slot";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[0-9\s-]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        await createBookingMutation.mutateAsync({
          customerFullName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          branchId: formData.branchId,
          treatmentId: formData.treatmentId || undefined,
          packageId: formData.packageId || undefined,
          appointmentDate: formData.date,
          startTime: formData.startTime,
          concerns: formData.concerns
        });
        setSuccess(true);
      } catch (err: any) {
        setErrors({ submit: err.response?.data?.message || 'Failed to submit booking. Please try again.' });
      }
    }
  };

  const formContainerStyle = {
    padding: '40px',
    width: '100%',
    maxWidth: '560px',
    backgroundColor: '#0F0F0F', // Rich dark slate black
    border: '1px solid var(--color-border-strong)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-luxury)',
    position: 'relative' as const,
    color: '#FFFFFF', // High contrast white text
    fontFamily: 'var(--font-sans)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(212, 175, 55, 0.4)', // Subtle gold border
    backgroundColor: '#161616', // Dark background for input contrast
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    color: '#FFFFFF', // White input text
    transition: 'var(--transition-fast)',
    marginTop: '6px',
  };

  const labelStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    fontWeight: '600',
    color: 'var(--color-gold-light)', // Light gold labels
    display: 'block'
  };

  const errorTextStyle = {
    color: '#F472B6', // High visibility rose pink for errors
    fontSize: '12px',
    marginTop: '4px',
    fontFamily: 'var(--font-sans)'
  };

  const selectedBranch = branches.find(b => b.id === formData.branchId);
  const selectedTreatment = treatments.find(t => t.id === formData.treatmentId);
  const selectedPackage = packages.find(p => p.id === formData.packageId);
  const serviceName = selectedTreatment?.name || selectedPackage?.name || 'Consultation';

  if (success) {
    return (
      <div style={isModal ? {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
      } : {}}>
        <div style={{ ...formContainerStyle, textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-gold-gradient)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '12px', fontWeight: 400, color: '#FFFFFF' }}>
            Confirmed
          </h3>
          
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '32px', maxWidth: '420px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            Thank you, <strong style={{ color: 'var(--color-gold-light)' }}>{formData.name}</strong>. Your luxury aesthetic care schedule has been successfully secured. A confirmation email has been sent to <span style={{ textDecoration: 'underline' }}>{formData.email}</span>.
          </p>

          <div style={{
            textAlign: 'left',
            backgroundColor: '#161616',
            border: '1px dashed var(--color-gold-base)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '32px',
            fontSize: '13px',
            lineHeight: '1.8',
            color: '#FFFFFF'
          }}>
            <div><strong style={{ color: 'var(--color-gold-light)' }}>Service:</strong> {serviceName}</div>
            <div><strong style={{ color: 'var(--color-gold-light)' }}>Location:</strong> {selectedBranch?.displayName} (North Haven, CT)</div>
            <div><strong style={{ color: 'var(--color-gold-light)' }}>Date:</strong> {formData.date}</div>
            <div><strong style={{ color: 'var(--color-gold-light)' }}>Time:</strong> {timeSlots.find(t => t.startTime === formData.startTime)?.label || formData.startTime}</div>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => {
              setFormData({
                treatmentId: defaultTreatmentId,
                packageId: '',
                branchId: '',
                date: '',
                startTime: '',
                name: '',
                email: '',
                phone: '',
                concerns: ''
              });
              setSuccess(false);
              onClose();
            }}
            style={{ width: '100%', padding: '14px' }}
          >
            Done & Close
          </button>
        </div>
      </div>
    );
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#FFFFFF', fontWeight: 400, marginBottom: '6px' }}>
          Request Appointment
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
          North Haven Sanctuary • 132 Middletown Ave
        </p>
      </div>

      {/* Service Selection */}
      <div>
        <label style={labelStyle}>Select Service</label>
        <select 
          value={formData.treatmentId || formData.packageId} 
          onChange={(e) => {
            const val = e.target.value;
            if (val.startsWith('t_')) {
              setFormData({...formData, treatmentId: val.replace('t_', ''), packageId: ''});
            } else if (val.startsWith('p_')) {
              setFormData({...formData, packageId: val.replace('p_', ''), treatmentId: ''});
            } else {
              setFormData({...formData, treatmentId: '', packageId: ''});
            }
          }}
          style={inputStyle}
          className="select-custom"
        >
          <option value="" style={{ backgroundColor: '#161616', color: '#FFF' }}>-- Choose a Service --</option>
          <optgroup label="Treatments" style={{ backgroundColor: '#161616', color: 'var(--color-gold-light)' }}>
            {treatments.map(t => <option key={`t_${t.id}`} value={`t_${t.id}`} style={{ backgroundColor: '#161616', color: '#FFF' }}>{t.name} (${(t.priceCents/100).toFixed(2)})</option>)}
          </optgroup>
          <optgroup label="Packages" style={{ backgroundColor: '#161616', color: 'var(--color-gold-light)' }}>
            {packages.map(p => <option key={`p_${p.id}`} value={`p_${p.id}`} style={{ backgroundColor: '#161616', color: '#FFF' }}>{p.name} (${(p.priceCents/100).toFixed(2)})</option>)}
          </optgroup>
        </select>
        {errors.service && <div style={errorTextStyle}>{errors.service}</div>}
      </div>

      {/* Date & Time Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
        <div>
          <label style={labelStyle}>Preferred Date</label>
          <input 
            type="date" 
            value={formData.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData({...formData, date: e.target.value, startTime: ''})}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
          {errors.date && <div style={errorTextStyle}>{errors.date}</div>}
        </div>

        <div>
          <label style={labelStyle}>Preferred Time</label>
          <select
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            disabled={!formData.date}
            style={inputStyle}
          >
            <option value="" style={{ backgroundColor: '#161616', color: '#FFF' }}>-- Select Time --</option>
            {timeSlots.map(t => (
              <option 
                key={t.id} 
                value={t.startTime} 
                disabled={!t.available} 
                style={{ backgroundColor: '#161616', color: t.available ? '#FFF' : '#666' }}
              >
                {t.label} {!t.available ? '(Booked)' : ''}
              </option>
            ))}
          </select>
          {errors.startTime && <div style={errorTextStyle}>{errors.startTime}</div>}
        </div>
      </div>

      {/* Name and Phone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
        <div>
          <label style={labelStyle}>Full Name</label>
          <input 
            type="text" 
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={inputStyle}
          />
          {errors.name && <div style={errorTextStyle}>{errors.name}</div>}
        </div>

        <div>
          <label style={labelStyle}>Phone Number</label>
          <input 
            type="tel" 
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={inputStyle}
          />
          {errors.phone && <div style={errorTextStyle}>{errors.phone}</div>}
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label style={labelStyle}>Email Address</label>
        <input 
          type="email" 
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={inputStyle}
        />
        {errors.email && <div style={errorTextStyle}>{errors.email}</div>}
      </div>

      {/* Concerns */}
      <div>
        <label style={labelStyle}>Skin Concerns / Notes (Optional)</label>
        <textarea 
          rows={3}
          placeholder="Any details to help us prepare for your visit..."
          value={formData.concerns}
          onChange={(e) => setFormData({...formData, concerns: e.target.value})}
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>

      {errors.submit && (
        <div style={{ 
          ...errorTextStyle, 
          padding: '8px', 
          backgroundColor: 'rgba(244, 114, 182, 0.1)', 
          border: '1px solid #F472B6',
          borderRadius: '4px' 
        }}>
          {errors.submit}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
        {isModal && (
          <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px' }} disabled={createBookingMutation.isPending}>
          {createBookingMutation.isPending ? 'Confirming...' : 'Request Appointment'}
        </button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      >
        <div style={{ 
          ...formContainerStyle, 
          maxHeight: '90vh', 
          overflowY: 'auto',
          animation: 'fadeInUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards' 
        }}>
          {/* Close button */}
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.6)',
              transition: 'var(--transition-fast)'
            }}
            className="form-close-btn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          {renderForm()}
        </div>

        <style>{`
          .form-close-btn:hover {
            color: #FFFFFF !important;
            transform: rotate(90deg);
          }
          
          @media (max-width: 500px) {
            .form-row {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ ...formContainerStyle, maxWidth: '100%' }}>
      {renderForm()}
      <style>{`
        @media (max-width: 500px) {
          .form-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
