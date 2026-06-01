import React, { useState } from 'react';

export default function BookingForm({ isModal = false, onClose = () => {}, defaultTreatment = "" }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    treatment: defaultTreatment,
    branch: 'Beverly Hills',
    date: '',
    timeSlot: '',
    name: '',
    email: '',
    phone: '',
    concerns: ''
  });
  
  const [errors, setErrors] = useState({});

  const treatments = [
    "Hydra Facial — Skin Deep Hydration",
    "Chemical Peel — Advanced Resurfacing",
    "Laser Treatment — Pigment & Rejuvenation",
    "Anti-Aging Therapy — Collagen Sculpting",
    "Skin Rejuvenation — Luminosity Cellular",
    "The Beverly Hills Radiance Package",
    "The London Glow Classic Package",
    "The Dubai Elite Restorative Package"
  ];

  const branches = [
    "Beverly Hills (Rodeo Dr)",
    "London (Mayfair)",
    "Dubai (Downtown)"
  ];

  const timeSlots = [
    "09:00 AM", "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM", "04:30 PM", "06:00 PM"
  ];

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.treatment) newErrors.treatment = "Please select a treatment";
      if (!formData.branch) newErrors.branch = "Please select a clinic location";
    } else if (step === 2) {
      if (!formData.date) newErrors.date = "Please select an appointment date";
      if (!formData.timeSlot) newErrors.timeSlot = "Please select a preferred time slot";
    } else if (step === 3) {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      setStep(4); // Success step
    }
  };

  const formContainerStyle = {
    padding: '36px',
    width: '100%',
    maxWidth: '580px',
    backgroundColor: '#FAF6F4',
    border: '1px solid var(--color-border-light)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-luxury)',
    position: 'relative',
    color: 'var(--color-text-dark)',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border-strong)',
    backgroundColor: 'white',
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
            backgroundColor: step >= num ? 'var(--color-gold-base)' : 'white',
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
          <div className="reveal-in">
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px', fontWeight: 400 }}>Select Treatment & Location</h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Choose your luxury wellness treatment and one of our premium locations.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Select Treatment
              </label>
              <select 
                value={formData.treatment} 
                onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                style={inputStyle}
                className="select-custom"
              >
                <option value="">-- Choose a Treatment --</option>
                {treatments.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.treatment && <div style={errorTextStyle}>{errors.treatment}</div>}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Clinic Location
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '8px' }}>
                {branches.map(b => (
                  <div 
                    key={b}
                    onClick={() => setFormData({...formData, branch: b})}
                    style={{
                      padding: '12px 18px',
                      border: formData.branch === b ? '2px solid var(--color-gold-base)' : '1px solid var(--color-border-strong)',
                      backgroundColor: formData.branch === b ? 'var(--color-gold-gradient-soft)' : 'white',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: formData.branch === b ? '600' : '400',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>
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
          <div className="reveal-in">
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
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                style={inputStyle}
              />
              {errors.date && <div style={errorTextStyle}>{errors.date}</div>}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
                Preferred Time Slot
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                gap: '8px', 
                marginTop: '8px' 
              }}>
                {timeSlots.map(t => (
                  <div 
                    key={t}
                    onClick={() => setFormData({...formData, timeSlot: t})}
                    style={{
                      padding: '10px 4px',
                      border: formData.timeSlot === t ? '1px solid var(--color-gold-base)' : '1px solid var(--color-border-strong)',
                      backgroundColor: formData.timeSlot === t ? 'var(--color-gold-gradient)' : 'white',
                      color: formData.timeSlot === t ? 'white' : 'var(--color-text-dark)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textAlign: 'center',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: formData.timeSlot === t ? '600' : '500',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
              {errors.timeSlot && <div style={errorTextStyle}>{errors.timeSlot}</div>}
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
          <form onSubmit={handleSubmit} className="reveal-in">
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
                rows="3"
                placeholder="Mention any allergies, previous treatments, or focus areas..."
                value={formData.concerns}
                onChange={(e) => setFormData({...formData, concerns: e.target.value})}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={handlePrev} className="btn-secondary" style={{ flex: 1 }}>
                Back
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                Confirm Reservation
              </button>
            </div>
          </form>
        );
      case 4:
        return (
          <div className="reveal-in" style={{ textAlign: 'center', padding: '16px 0' }}>
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
              backgroundColor: '#FAF0EB',
              border: '1px dashed var(--color-gold-base)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '32px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              lineHeight: '1.8'
            }}>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Treatment:</strong> {formData.treatment}</div>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Clinic Location:</strong> {formData.branch}</div>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Date:</strong> {formData.date}</div>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Time Slot:</strong> {formData.timeSlot}</div>
              <div><strong style={{ color: 'var(--color-gold-dark)' }}>Assigned Concierge:</strong> Skin Suite 4, Elite Specialist</div>
            </div>

            <button 
              className="btn-primary" 
              onClick={() => {
                setFormData({
                  treatment: defaultTreatment,
                  branch: 'Beverly Hills',
                  date: '',
                  timeSlot: '',
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
        backgroundColor: 'rgba(42, 36, 33, 0.45)',
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
