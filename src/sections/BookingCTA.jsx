import React from 'react';
import BookingForm from '../components/BookingForm';

export default function BookingCTA({ defaultTreatment = "" }) {
  return (
    <section id="booking" className="section" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Background design accents */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(246, 185, 172, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: '80px',
          alignItems: 'center'
        }}
        className="booking-grid"
        >
          {/* Left Column: Reassurance & Narrative */}
          <div className="reveal-in">
            <span className="section-subtitle">Begin Your Journey</span>
            
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '24px' }}>
              Schedule Your Priority Consultation
            </h2>
            
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 300,
              lineHeight: '1.8',
              color: 'var(--color-text-muted)',
              marginBottom: '32px'
            }}>
              Take the first step toward cellular skin restoration. Secure an appointment in our Beverly Hills, London, or Dubai clinic branches using our intuitive medical scheduling system.
            </p>

            {/* List of client guarantees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '1px solid var(--color-border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold-dark)',
                  boxShadow: 'var(--shadow-luxury)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Secure Intake Privacy
                  </h4>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 300 }}>
                    All patient clinical records are encrypted and protected under premium data acts.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '1px solid var(--color-border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold-dark)',
                  boxShadow: 'var(--shadow-luxury)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Flexible Re-scheduling
                  </h4>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 300 }}>
                    Enjoy flexible re-scheduling triggers up to 24 hours prior to appointment.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '1px solid var(--color-border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold-dark)',
                  boxShadow: 'var(--shadow-luxury)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Complimentary Consultation
                  </h4>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 300 }}>
                    Receive a cell-deep skin mapping diagnostic session during your initial visit.
                  </span>
                </div>
              </div>
            </div>

            {/* Operating guarantee badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#FAF0EB',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              fontSize: '12px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-gold-dark)',
              fontWeight: 500,
              letterSpacing: '0.02em'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Our staff reaches out within 2 hours of reservation to finalize details.</span>
            </div>
          </div>

          {/* Right Column: Inline Form */}
          <div className="reveal-in" style={{ animationDelay: '0.2s', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <BookingForm isModal={false} defaultTreatment={defaultTreatment} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .booking-grid {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
        }
      `}</style>
    </section>
  );
}
