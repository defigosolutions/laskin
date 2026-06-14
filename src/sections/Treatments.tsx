import React, { useState } from 'react';
import { usePublicTreatments, usePublicCategories } from '../hooks/usePublicApi';
import type { Treatment } from '../types';

export default function Treatments({ onBookTreatment }: { onBookTreatment: (id: string) => void }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  const { data: categories } = usePublicCategories();
  const { data: treatments, isLoading, isError } = usePublicTreatments({ 
    categoryId: activeFilter !== 'all' ? activeFilter : undefined 
  });

  return (
    <section id="treatments" className="section" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Featured Treatments</span>
          <h2 className="section-title">Elevate Your Skincare Journey</h2>
          <p className="section-description">
            Discover our curated, medical-grade skin therapies designed by world-renowned specialists to restore cellular luminosity and natural beauty.
          </p>
        </div>

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '50px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              border: activeFilter === 'all' ? '1px solid var(--color-gold-base)' : '1px solid var(--color-border-light)',
              background: activeFilter === 'all' ? 'var(--color-gold-gradient)' : 'rgba(255, 255, 255, 0.05)',
              color: activeFilter === 'all' ? 'white' : 'var(--color-text-dark)',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: activeFilter === 'all' ? '600' : '400',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              boxShadow: activeFilter === 'all' ? '0 4px 10px rgba(194, 155, 120, 0.2)' : 'none'
            }}
          >
            All Therapies
          </button>
          
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                border: activeFilter === cat.id ? '1px solid var(--color-gold-base)' : '1px solid var(--color-border-light)',
                background: activeFilter === cat.id ? 'var(--color-gold-gradient)' : 'rgba(255, 255, 255, 0.05)',
                color: activeFilter === cat.id ? 'white' : 'var(--color-text-dark)',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: activeFilter === cat.id ? '600' : '400',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: activeFilter === cat.id ? '0 4px 10px rgba(194, 155, 120, 0.2)' : 'none'
              }}
            >
              {cat.displayName}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            Loading treatments...
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'red', fontFamily: 'var(--font-sans)' }}>
            Failed to load treatments. Please try again later.
          </div>
        ) : treatments?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            No treatments available in this category.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '30px'
          }}
          className="treatments-grid"
          >
            {treatments?.map((t) => (
              <div
                key={t.id}
                className="glass-panel luxury-hover-card reveal-in active"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  height: '100%',
                  backgroundColor: 'transparent'
                }}
              >
                {/* Card Image */}
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/10', backgroundColor: '#e5e5e5' }}>
                  {t.imageUrl && (
                    <img 
                      src={t.imageUrl} 
                      alt={t.name} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 6s ease'
                      }}
                      className="card-image"
                    />
                  )}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(42, 36, 33, 0.6) 0%, transparent 50%)'
                  }} />
                  
                  {/* Category Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'var(--color-glass-dark)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    border: '1px solid var(--color-border-light)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '9px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {t.category?.displayName || 'Treatment'}
                  </span>

                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '20px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.05em', fontWeight: 500 }}>
                      {t.durationMinutes} Mins
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-text-dark)', marginBottom: '4px', fontWeight: 400 }}>
                    {t.name}
                  </h3>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-gold-base)', letterSpacing: '0.05em', display: 'block', marginBottom: '16px', fontWeight: 500 }}>
                    {t.tagline || 'Clinical Skin Restoration'}
                  </span>
                  
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    fontWeight: 300,
                    lineHeight: '1.7',
                    marginBottom: '24px',
                    flex: 1
                  }}>
                    {t.shortDescription && t.shortDescription.length > 120 ? `${t.shortDescription.substring(0, 120)}...` : t.shortDescription}
                  </p>

                  {/* Card Action footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--color-border-light)',
                    paddingTop: '20px',
                    marginTop: 'auto'
                  }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-dark)' }}>
                      ${(t.priceCents / 100).toFixed(2)} {t.currency}
                    </span>
                    
                    <button 
                      onClick={() => setSelectedTreatment(t)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-gold-dark)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: '600',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'var(--transition-fast)'
                      }}
                      className="explore-link"
                    >
                      Explore Details
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-out/Fade-in detailed Drawer Panel */}
      {selectedTreatment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(42, 36, 33, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 1500,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedTreatment(null);
        }}
        >
          <div style={{
            width: '100%',
            maxWidth: '640px',
            height: '100%',
            backgroundColor: 'var(--color-bg-secondary)',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideLeft 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
            position: 'relative',
            overflowY: 'auto'
          }}>
            {/* Close trigger */}
            <button 
              onClick={() => setSelectedTreatment(null)}
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-glass-dark)',
                border: '1px solid var(--color-border-light)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-dark)',
                zIndex: 20,
                boxShadow: 'var(--shadow-luxury)'
              }}
              className="drawer-close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Banner Image */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#e5e5e5' }}>
              {selectedTreatment.imageUrl && (
                <img 
                  src={selectedTreatment.imageUrl} 
                  alt={selectedTreatment.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #FAFAF9 0%, transparent 60%)'
              }} />
            </div>

            {/* Panel Body Content */}
            <div style={{ padding: '0 40px 40px 40px', flex: 1, marginTop: '-30px', position: 'relative', zIndex: 10 }}>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--color-gold-base)',
                fontWeight: '600',
                display: 'block',
                marginBottom: '8px'
              }}>
                Aesthetic Clinical Care
              </span>
              
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', color: 'var(--color-text-dark)', marginBottom: '6px', fontWeight: 400 }}>
                {selectedTreatment.name}
              </h2>
              
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px', letterSpacing: '0.05em' }}>
                {selectedTreatment.tagline}
              </p>

              {/* Stats / Metadata pills */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                backgroundColor: 'var(--color-glass-white)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Pricing</span>
                  <strong style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-text-dark)' }}>${(selectedTreatment.priceCents / 100).toFixed(2)}</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--color-border-light)', borderRight: '1px solid var(--color-border-light)' }}>
                  <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Duration</span>
                  <strong style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-text-dark)' }}>{selectedTreatment.durationMinutes} Mins</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Recovery</span>
                  <strong style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-dark)' }}>{selectedTreatment.recoveryText || 'Minimal'}</strong>
                </div>
              </div>

              {/* Description */}
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 600 }}>
                Procedural Overview
              </h4>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 300, lineHeight: '1.7', marginBottom: '24px' }}>
                {selectedTreatment.shortDescription}
              </p>

              {/* Science clinical detail */}
              {selectedTreatment.scientificText && (
                <div style={{
                  backgroundColor: 'var(--color-glass-white)',
                  borderLeft: '3px solid var(--color-gold-base)',
                  padding: '16px 20px',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  marginBottom: '32px'
                }}>
                  <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-gold-dark)', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>
                    Scientific Rationale
                  </h5>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 300, lineHeight: '1.6' }}>
                    {selectedTreatment.scientificText}
                  </p>
                </div>
              )}

              {/* Step by step procedure */}
              {selectedTreatment.steps && selectedTreatment.steps.length > 0 && (
                <>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.1em', marginBottom: '14px', fontWeight: 600 }}>
                    Step-by-Step Experience
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px', padding: 0 }}>
                    {selectedTreatment.steps.map((step) => (
                      <li key={step.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '13px', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontWeight: 300 }}>
                        <span style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--color-gold-gradient-soft)', 
                          color: 'var(--color-gold-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: '600',
                          flexShrink: 0
                        }}>
                          {step.stepOrder}
                        </span>
                        <span style={{ lineHeight: '1.5' }}>{step.description}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Book Button */}
              <button 
                className="btn-primary" 
                onClick={() => {
                  setSelectedTreatment(null);
                  onBookTreatment(selectedTreatment.id); // Passing ID to booking modal
                }}
                style={{ width: '100%', padding: '16px' }}
              >
                Book {selectedTreatment.name} Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .luxury-hover-card:hover .card-image {
          transform: scale(1.05);
        }
        
        .explore-link:hover {
          color: var(--color-text-dark) !important;
          gap: 8px !important;
        }
        
        .drawer-close:hover {
          background-color: white !important;
          color: var(--color-gold-dark) !important;
          transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
          .treatments-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
