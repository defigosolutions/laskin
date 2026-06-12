import React from 'react';
import { usePublicSpecialists } from '../hooks/usePublicApi';

export default function Specialists() {
  const { data: specialists, isLoading, isError } = usePublicSpecialists();

  return (
    <section id="specialists" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Elite Pedigree</span>
          <h2 className="section-title">Our Medical Specialists</h2>
          <p className="section-description">
            Entrust your skin health to our board-certified cosmetic physicians and licensed medical clinicians representing elite academic and aesthetic backgrounds.
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            Loading specialists...
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'red', fontFamily: 'var(--font-sans)' }}>
            Failed to load specialists. Please try again later.
          </div>
        ) : specialists?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            No specialists found.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px'
          }}
          className="spec-grid"
          >
            {specialists?.map((s) => (
              <div
                key={s.id}
                className="reveal-in spec-card active"
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-luxury)',
                  aspectRatio: '3/4',
                  backgroundColor: 'var(--color-bg-tertiary)'
                }}
              >
                {/* Specialist Image */}
                {s.portraitUrl ? (
                  <img 
                    src={s.portraitUrl} 
                    alt={s.fullName} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 6s ease'
                    }}
                    className="spec-image"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e5e5e5',
                    color: '#999',
                    fontFamily: 'var(--font-sans)'
                  }}>
                    No Image
                  </div>
                )}

                {/* Gradient dark fade layer */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 10, 10, 0.9) 0%, rgba(10, 10, 10, 0.3) 50%, transparent 100%)',
                  zIndex: 5
                }} />

                {/* Standard text content (bottom-aligned) */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '30px',
                  color: 'white',
                  zIndex: 10,
                  transition: 'transform 0.4s ease'
                }}
                className="spec-details-static"
                >
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--color-gold-light)',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    {s.role}
                  </span>
                  
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '24px',
                    color: 'white',
                    fontWeight: 400,
                    marginBottom: '6px'
                  }}>
                    {s.fullName}
                  </h3>
                  
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    opacity: 0.85,
                    letterSpacing: '0.05em'
                  }}>
                    {s.credential}
                  </span>
                </div>

                {/* Hover Overlay Panel (Slides Up or Fades In) */}
                <div style={{
                  position: 'absolute',
                  inset: '0',
                  background: 'var(--color-glass-dark)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '40px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  color: 'white',
                  zIndex: 15,
                  opacity: 0,
                  transition: 'opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: 'var(--radius-lg)'
                }}
                className="spec-hover-overlay"
                >
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--color-gold-light)',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    {s.role}
                  </span>
                  
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '26px',
                    color: 'white',
                    fontWeight: 400,
                    marginBottom: '2px'
                  }}>
                    {s.fullName}
                  </h3>
                  
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    color: 'var(--color-gold-light)',
                    letterSpacing: '0.05em',
                    marginBottom: '24px',
                    display: 'block',
                    opacity: 0.9
                  }}>
                    {s.credential}
                  </span>

                  <div style={{ width: '40px', height: '1px', background: 'var(--color-gold-light)', marginBottom: '20px' }} />

                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold-light)', marginBottom: '6px' }}>
                    Aesthetic Focus
                  </h4>
                  
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: 300, marginBottom: '24px', lineHeight: '1.5' }}>
                    {s.focus || 'Comprehensive aesthetic and dermatological treatments.'}
                  </p>

                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold-light)', marginBottom: '6px' }}>
                    Clinical Philosophy
                  </h4>
                  
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: 300, fontStyle: 'italic', lineHeight: '1.6' }}>
                    "{s.philosophy || "Dedicated to achieving natural, refined results that enhance each patient's inherent beauty."}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .spec-card:hover .spec-image {
          transform: scale(1.05);
        }
        
        .spec-card:hover .spec-hover-overlay {
          opacity: 1 !important;
        }
        
        @media (max-width: 768px) {
          .spec-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
