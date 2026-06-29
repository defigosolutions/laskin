import React from 'react';

export default function Specialists() {
  return (
    <section id="specialists" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Our Specialist</span>
          <h2 className="section-title">Clinical Expertise</h2>
          <p className="section-description">
            Entrust your skin health to our founder, a board-certified clinical aesthetician representing over a decade of elite aesthetic care and training.
          </p>
        </div>

        {/* Profile Split Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '0.85fr 1.15fr',
          gap: '60px',
          alignItems: 'start',
          marginTop: '50px'
        }}
        className="specialist-profile-grid"
        >
          {/* Portrait Column */}
          <div style={{ position: 'relative' }} className="reveal-in active">
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              width: '100%',
              height: '100%',
              border: '1px solid var(--color-gold-base)',
              borderRadius: 'var(--radius-lg)',
              pointerEvents: 'none',
              zIndex: 1
            }} />
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-luxury)',
              zIndex: 2,
              aspectRatio: '4/5',
              backgroundColor: 'var(--color-bg-tertiary)'
            }}>
              <img 
                src="/laura.jpeg" 
                alt="Laura Andrade" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          </div>

          {/* Biography Column */}
          <div className="reveal-in active" style={{ animationDelay: '0.2s' }}>
            <span style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--color-gold-base)',
              fontWeight: '600',
              display: 'block',
              marginBottom: '8px',
              fontFamily: 'var(--font-sans)'
            }}>
              Founder & Lead Specialist
            </span>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '38px',
              fontWeight: '400',
              marginBottom: '24px',
              color: 'var(--color-text-light)',
              letterSpacing: '-0.01em'
            }}>
              Laura Andrade
            </h3>

            <p style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '15px', 
              fontWeight: 300, 
              lineHeight: '1.8', 
              color: 'rgba(255, 255, 255, 0.75)', 
              marginBottom: '20px' 
            }}>
              With over 13 years of experience in the aesthetics industry, I am passionate about helping clients achieve healthy, radiant skin and renewed confidence. As the founder of LA Skin & Aesthetics, I specialize in advanced skincare treatments, facial rejuvenation, and holistic wellness solutions tailored to each individual's unique needs.
            </p>

            <p style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '15px', 
              fontWeight: 300, 
              lineHeight: '1.8', 
              color: 'rgba(255, 255, 255, 0.75)', 
              marginBottom: '20px' 
            }}>
              Throughout my career, I have pursued extensive advanced training and continuing education, allowing me to stay current with the latest techniques, technologies, and innovations in aesthetic care. My approach combines professional expertise with personalized attention, ensuring every client receives treatments designed to enhance their natural beauty while delivering elegant, balanced, and natural-looking results.
            </p>

            <p style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: '15px', 
              fontWeight: 300, 
              lineHeight: '1.8', 
              color: 'rgba(255, 255, 255, 0.75)', 
              marginBottom: '32px' 
            }}>
              At LA Skin & Aesthetics, I believe that beauty begins with healthy skin and self-confidence. My goal is to create a welcoming environment where clients feel cared for, understood, and empowered throughout their aesthetic journey.
            </p>

            <h4 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: '600',
              marginBottom: '20px',
              color: 'var(--color-text-light)'
            }}>
              Why clients choose LA Skin & Aesthetics:
            </h4>

            <ul style={{ 
              listStyle: 'none', 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px', 
              padding: 0, 
              marginBottom: '36px' 
            }} className="why-choose-grid">
              {[
                'Over 13 years of professional experience.',
                'Advanced training and ongoing education.',
                'Personalized treatment plans.',
                'Advanced skincare and facial rejuvenation services.',
                'Innovative aesthetic technologies.',
                'Warm, professional, client-centered care.'
              ].map((item, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 300,
                  fontFamily: 'var(--font-sans)'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div style={{ height: '1px', background: 'var(--color-border-light)', marginBottom: '24px' }} />

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 300, marginBottom: '8px' }}>
              Dedicated to excellence, natural beauty, and the well-being of every client.
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 300 }}>
              * Professional certifications are available for review at the clinic.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .specialist-profile-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .why-choose-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}
