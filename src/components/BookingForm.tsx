import React, { useState, useEffect } from 'react';
import { 
  usePublicTreatments, 
  usePublicPackages, 
  usePublicBranches, 
  useAvailability, 
  useCreateBooking 
} from '../hooks/usePublicApi';

export default function BookingForm({ isModal = false, onClose = () => {}, defaultTreatmentId = "" }) {
  const [step, setStep] = useState(1);
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

  // Data Queries
  const { data: treatments = [], isLoading: loadingTreatments } = usePublicTreatments();
  const { data: packages = [], isLoading: loadingPackages } = usePublicPackages();
  const { data: branches = [], isLoading: loadingBranches } = usePublicBranches();

  // Selected entities for display
  const selectedBranch = branches.find(b => b.id === formData.branchId);
  const selectedTreatment = treatments.find(t => t.id === formData.treatmentId);
  const selectedPackage = packages.find(p => p.id === formData.packageId);
  const serviceName = selectedTreatment?.name || selectedPackage?.name || 'Consultation';

  // Fetch availability when branch and date are selected
  const { data: timeSlots = [], isLoading: loadingAvailability, isFetching: fetchingAvailability } = useAvailability({
    branchId: formData.branchId,
    date: formData.date
  });

  const createBookingMutation = useCreateBooking();

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.treatmentId && !formData.packageId) newErrors.service = "Please select a service";
      if (!formData.branchId) newErrors.branchId = "Please select a clinic location";
    } else if (step === 2) {
      if (!formData.date) newErrors.date = "Please select an appointment date";
      if (!formData.startTime) newErrors.startTime = "Please select a preferred time slot";
    } else if (step === 3) {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[+]?[0-9\\s-]{7,15}$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
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
        setStep(4); // Success step
      } catch (err: any) {
        setErrors({ submit: err.response?.data?.message || 'Failed to submit booking. Please try again.' });
      }
    }
  };

  const formContainerStyle = {
    padding: '36px',
    width: '100%',
    maxWidth: '580px',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-luxury)',
    position: 'relative' as const,
    color: 'var(--color-text-dark)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border-strong)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    fontFamily: 'var(--font-sans)',
    fontSize: '14px',
    color: 'var(--color-text-dark)',
    transition: 'var(--transition-fast)',
    marginTop: '6px',
  };

  const errorTextStyle = {
    color: '#B23B3B',
    fontSize: '12px',
    marginTop: '4px',
    fontFamily: 'var(--font-sans)'
  };

  const renderProgressBar = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
      {[1, 2, 3].map((num) => (
        <React.Fragment key={num}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: step >= num ? 'var(--color-gold-base)' : 'var(--color-bg-tertiary)',
            border: step >= num ? '1px solid var(--color-gold-base)' : '1px solid var(--color-border-strong)',
            color: step >= num ? 'white' : 'var(--color-text-muted)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'var(--transition-smooth)'
          }}>
            {num}
          </div>
          {num < 3 && (
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: step > num ? 'var(--color-gold-base)' : 'var(--color-border-light)',
              margin: '0 8px',
              transition: 'var(--transition-smooth)'
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="reveal-in active">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px', fontWeight: 400 }}>Select Service & Location</h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Choose your luxury wellness service and one of our premium locations.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Select Service
              </label>
              {loadingTreatments || loadingPackages ? (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>Loading services...</div>
              ) : (
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
                  <option value="">-- Choose a Service --</option>
                  <optgroup label="Treatments">
                    {treatments.map(t => <option key={`t_${t.id}`} value={`t_${t.id}`}>{t.name}</option>)}
                  </optgroup>
                  <optgroup label="Packages">
                    {packages.map(p => <option key={`p_${p.id}`} value={`p_${p.id}`}>{p.name}</option>)}
                  </optgroup>
                </select>
              )}
              {errors.service && <div style={errorTextStyle}>{errors.service}</div>}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Clinic Location
              </label>
              {loadingBranches ? (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>Loading locations...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '8px' }}>
                  {branches.map(b => (
                    <div 
                      key={b.id}
                      onClick={() => setFormData({...formData, branchId: b.id})}
                      style={{
                        padding: '12px 18px',
                        border: formData.branchId === b.id ? '2px solid var(--color-gold-base)' : '1px solid var(--color-border-strong)',
                        backgroundColor: formData.branchId === b.id ? 'var(--color-gold-gradient-soft)' : 'rgba(255,255,255,0.05)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: formData.branchId === b.id ? '600' : '400',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {b.displayName} - {b.city}
                    </div>
                  ))}
                </div>
              )}
              {errors.branchId && <div style={errorTextStyle}>{errors.branchId}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleNext} className="btn-primary" style={{ width: '100%' }}>
                Next: Select Date & Time
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="reveal-in active">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px', fontWeight: 400 }}>Choose Date & Time</h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Select a preferred appointment date and scheduling time slot.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Appointment Date
              </label>
              <input 
                type="date" 
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setFormData({...formData, date: e.target.value, startTime: ''});
                }}
                style={inputStyle}
              />
              {errors.date && <div style={errorTextStyle}>{errors.date}</div>}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Preferred Time Slot
              </label>
              {!formData.date ? (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>Please select a date first.</div>
              ) : fetchingAvailability ? (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>Checking availability...</div>
              ) : timeSlots.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'red', marginTop: '6px' }}>No availability for this date.</div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                  gap: '8px', 
                  marginTop: '8px' 
                }}>
                  {timeSlots.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => {
                        if (t.available) setFormData({...formData, startTime: t.startTime});
                      }}
                      style={{
                        padding: '10px 4px',
                        border: formData.startTime === t.startTime ? '1px solid var(--color-gold-base)' : '1px solid var(--color-border-strong)',
                        backgroundColor: formData.startTime === t.startTime ? 'var(--color-gold-gradient)' : 'rgba(255,255,255,0.05)',
                        color: formData.startTime === t.startTime ? 'white' : 'var(--color-text-dark)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: t.available ? 'pointer' : 'not-allowed',
                        opacity: t.available ? 1 : 0.4,
                        fontSize: '11px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: formData.startTime === t.startTime ? '600' : '500',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {t.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.startTime && <div style={errorTextStyle}>{errors.startTime}</div>}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={handlePrev} className="btn-secondary" style={{ flex: 1 }}>
                Back
              </button>
              <button onClick={handleNext} className="btn-primary" style={{ flex: 2 }}>
                Continue: Details
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <form onSubmit={handleSubmit} className="reveal-in active">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px', fontWeight: 400 }}>Personal Information</h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Provide your details so we can secure your priority reservation.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Full Name
              </label>
              <input 
                type="text" 
                placeholder="Lady Alexandra"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={inputStyle}
              />
              {errors.name && <div style={errorTextStyle}>{errors.name}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }} className="grid-mobile-1">
              <div>
                <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="alexandra@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={inputStyle}
                />
                {errors.email && <div style={errorTextStyle}>{errors.email}</div>}
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 0199"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={inputStyle}
                />
                {errors.phone && <div style={errorTextStyle}>{errors.phone}</div>}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Skin Concerns / Custom Request (Optional)
              </label>
              <textarea 
                rows={3}
                placeholder="Mention any allergies, previous treatments, or focus areas..."
                value={formData.concerns}
                onChange={(e) => setFormData({...formData, concerns: e.target.value})}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>
            
            {errors.submit && (
              <div style={{ 
                ...errorTextStyle, 
                marginBottom: '16px', 
                padding: '8px', 
                backgroundColor: 'rgba(178, 59, 59, 0.1)', 
                border: '1px solid #B23B3B',
                borderRadius: '4px' 
              }}>
                {errors.submit}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={handlePrev} className="btn-secondary" style={{ flex: 1 }} disabled={createBookingMutation.isPending}>
                Back
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending ? 'Confirming...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        );
      case 4:
        return (
          <div className="reveal-in active" style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-gold-gradient)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto 24px auto',
              boxShadow: '0 8px 20px rgba(194, 155, 120, 0.3)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '12px', fontWeight: 400 }}>
              Reservation Confirmed
            </h3>
            
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '32px', maxWidth: '420px', margin: '0 auto 32px auto' }}>
              Thank you, <strong style={{ color: 'var(--color-text-dark)' }}>{formData.name}</strong>. Your luxury aesthetic care schedule has been successfully secured. A personalized concierge confirmation has been sent to <span style={{ textDecoration: 'underline' }}>{formData.email}</span>.
            </p>

            <div style={{
              textAlign: 'left',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px dashed var(--color-gold-base)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '32px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              lineHeight: '1.8'
            }}>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Service:</strong> {serviceName}</div>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Clinic Location:</strong> {selectedBranch?.displayName}</div>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Date:</strong> {formData.date}</div>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Time Slot:</strong> {timeSlots.find(t => t.startTime === formData.startTime)?.label || formData.startTime}</div>
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
                setStep(1);
                onClose();
              }}
              style={{ width: '100%' }}
            >
              Done & Close
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (isModal) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
          animation: 'fadeInUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards' 
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
              color: 'var(--color-text-muted)',
              transition: 'var(--transition-fast)'
            }}
            className="form-close-btn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          {step < 4 && renderProgressBar()}
          {renderContent()}
        </div>

        <style>{`
          .form-close-btn:hover {
            color: var(--color-text-dark) !important;
            transform: rotate(90deg);
          }
          
          @media (max-width: 480px) {
            .grid-mobile-1 {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // Inline styling for sections
  return (
    <div style={{ ...formContainerStyle, maxWidth: '100%' }}>
      {step < 4 && renderProgressBar()}
      {renderContent()}
      
      <style>{`
        @media (max-width: 480px) {
          .grid-mobile-1 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
