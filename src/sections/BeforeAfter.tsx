import React, { useState } from 'react';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { usePublicBeforeAfterCases } from '../hooks/usePublicApi';

export default function BeforeAfter() {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const { data: cases, isLoading, isError } = usePublicBeforeAfterCases();

  const currentCase = cases && cases.length > 0 ? cases[activeCaseIdx] : null;

  return (
    <section id="gallery" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Background radial gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'radial-gradient(circle at 10% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Real Results</span>
          <h2 className="section-title">Visible Skincare Transformations</h2>
          <p className="section-description">
            Explore authentic, unretouched before and after clinical outcomes. Witness the cell-deep transformation and skin-health efficacy of our targeted treatments.
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            Loading case studies...
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'red', fontFamily: 'var(--font-sans)' }}>
            Failed to load case studies. Please try again later.
          </div>
        ) : !cases || cases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            No case studies currently available.
          </div>
        ) : (
          <>
            {/* Case Selector Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '50px',
              flexWrap: 'wrap'
            }}>
              {cases.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCaseIdx(idx)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: activeCaseIdx === idx ? 'var(--color-gold-gradient)' : 'var(--color-glass-white)',
                    color: activeCaseIdx === idx ? 'var(--color-bg-primary)' : 'var(--color-text-dark)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    boxShadow: activeCaseIdx === idx ? '0 4px 15px rgba(194, 155, 120, 0.3)' : 'none'
                  }}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {/* Gallery Content Layout */}
            {currentCase && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                alignItems: 'center'
              }}
              className="gallery-grid"
              >
                {/* Column 1: Interactive Slider */}
                <div className="reveal-in active" key={currentCase.id}>
                  <BeforeAfterSlider 
                    beforeImage={currentCase.beforeImageUrl} 
                    afterImage={currentCase.afterImageUrl} 
                    beforeLabel="Pre-Treatment" 
                    afterLabel="Post-Treatment"
                    aspectRatio="4/5"
                  />
                </div>

                {/* Column 2: Clinical Details */}
                <div className="reveal-in active" style={{ animationDelay: '0.2s' }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--color-gold-dark)',
                    fontWeight: '600',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    Clinical Case Study
                  </span>
                  
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '36px',
                    color: 'var(--color-text-light)',
                    marginBottom: '4px',
                    fontWeight: 400
                  }}>
                    {currentCase.title}
                  </h3>
                  
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--color-gold-base)',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: '28px',
                    letterSpacing: '0.05em'
                  }}>
                    {currentCase.subtitle || currentCase.treatment?.name}
                  </span>

                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-light)', lineHeight: '1.6', marginBottom: '28px' }}>
                    Experience the transformative power of our customized skincare treatments. We address individual concerns with precision and care to reveal your skin's natural radiance and optimal health.
                  </p>

                  {/* Diagnostic stats list */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    marginBottom: '36px'
                  }}>
                    <div style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Timeline</span>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-light)' }}>{currentCase.timelineText}</p>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Patient Age Profile</span>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-light)' }}>{currentCase.ageProfile}</p>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Primary Indications</span>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: '400', color: 'var(--color-text-light)', lineHeight: '1.4' }}>{currentCase.primaryIndications}</p>
                    </div>

                    {currentCase.therapistNotes && (
                      <div style={{ borderBottom: '1px solid var(--color-border-light)', paddingBottom: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Therapist Assessment & Strategy</span>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: '300', color: 'var(--color-text-muted)', lineHeight: '1.6', fontStyle: 'italic', marginTop: '4px' }}>
                          "{currentCase.therapistNotes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Satisfaction badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'var(--color-glass-white)',
                    border: '1px solid var(--color-gold-base)',
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-gold-base)" stroke="var(--color-gold-base)" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-dark)'
                    }}>
                      {currentCase.satisfactionText || '100% Client Rating'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .gallery-grid {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
        }
      `}</style>
    </section>
  );
}
