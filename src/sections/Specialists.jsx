import React from 'react';

const specialists = [
  {
    id: 1,
    name: 'Dr. Evelyn Davenport',
    role: 'Chief Cosmetic Dermatologist',
    credential: 'Harvard Medical School • 15+ Yrs Exp',
    focus: 'Cellular anti-aging, custom injectables mapping, laser therapeutics',
    philosophy: 'Timeless beauty lies in preserving structural harmony. We regenerate, never over-exaggerate.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Dr. Marcus Sinclair',
    role: 'Lead Laser & Aesthetic Surgeon',
    credential: 'University of Oxford • 12+ Yrs Exp',
    focus: 'Micro-fractional laser resurfacing, structural jawline sculpting',
    philosophy: 'Modern laser science allows us to trigger the body’s own healing potential for flawless results.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Sarah Jenkins, LMA',
    role: 'Lead Clinical Aesthetician',
    credential: 'London Beauty Academy • 10+ Yrs Exp',
    focus: 'Medical-grade vortex facials, chemical cell-resurfacing',
    philosophy: 'A glowing complexion starts at the cellular layer. Healthy skin is the ultimate luxury asset.',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=500&auto=format&fit=crop'
  }
];

export default function Specialists() {
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

        {/* Specialists Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px'
        }}
        className="spec-grid"
        >
          {specialists.map((s) => (
            <div
              key={s.id}
              className="reveal-in spec-card"
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
              <img 
                src={s.image} 
                alt={s.name} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 6s ease'
                }}
                className="spec-image"
              />

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
                  {s.name}
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
                  {s.name}
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
                  {s.focus}
                </p>

                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold-light)', marginBottom: '6px' }}>
                  Clinical Philosophy
                </h4>
                
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: 300, fontStyle: 'italic', lineHeight: '1.6' }}>
                  "{s.philosophy}"
                </p>
              </div>
            </div>
          ))}
        </div>
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
