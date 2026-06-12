import React from 'react';
import { usePublicPackages } from '../hooks/usePublicApi';

export default function Packages({ onReservePackage }: { onReservePackage: (id: string) => void }) {
  const { data: packages, isLoading, isError } = usePublicPackages();

  return (
    <section id="packages" className="section" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Curated Journeys</span>
          <h2 className="section-title">Exclusive Treatment Packages</h2>
          <p className="section-description">
            Maximize your skin results by purchasing our curated clinical combinations. Complete wellness journeys crafted to deliver absolute, long-lasting transformation.
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            Loading packages...
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'red', fontFamily: 'var(--font-sans)' }}>
            Failed to load packages. Please try again later.
          </div>
        ) : packages?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            No packages currently available.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '30px',
            alignItems: 'stretch'
          }}
          className="packages-grid"
          >
            {packages?.map((pkg) => (
              <div
                key={pkg.id}
                className="glass-panel reveal-in pkg-card active"
                style={{
                  padding: '50px 40px',
                  backgroundColor: pkg.badge ? 'var(--color-glass-white)' : 'transparent',
                  border: pkg.badge ? '2px solid var(--color-gold-base)' : '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Gold highlights for bestseller */}
                {pkg.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--color-gold-gradient)',
                    color: 'white',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '9px',
                    fontWeight: '600',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 4px 10px rgba(194, 155, 120, 0.3)'
                  }}>
                    {pkg.badge}
                  </span>
                )}

                {/* Title & Tagline */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '28px',
                    color: 'var(--color-text-dark)',
                    fontWeight: 400,
                    marginBottom: '8px',
                    lineHeight: '1.2'
                  }}>
                    {pkg.name}
                  </h3>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    color: 'var(--color-gold-dark)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 500,
                    display: 'block'
                  }}>
                    {pkg.tagline || 'Clinical Skin Restoration'}
                  </span>
                </div>

                {/* Pricing section */}
                <div style={{
                  textAlign: 'center',
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 0',
                  marginBottom: '40px'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '38px',
                    fontWeight: '600',
                    color: 'var(--color-text-dark)',
                    display: 'block',
                    lineHeight: '1'
                  }}>
                    ${(pkg.priceCents / 100).toFixed(2)}
                  </span>
                  {pkg.valuePriceCents && (
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                      textDecoration: 'line-through',
                      letterSpacing: '0.05em',
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      ${(pkg.valuePriceCents / 100).toFixed(2)} Value
                    </span>
                  )}
                </div>

                {/* Includes checklist */}
                {pkg.inclusions && pkg.inclusions.length > 0 && (
                  <div style={{ marginBottom: '40px', flex: 1 }}>
                    <h4 style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--color-text-dark)',
                      marginBottom: '18px',
                      fontWeight: 600
                    }}>
                      Skin Journey Includes:
                    </h4>
                    
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', padding: 0 }}>
                      {pkg.inclusions.map((inc) => (
                        <li key={inc.position} style={{
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                          fontSize: '13px',
                          fontFamily: 'var(--font-sans)',
                          color: 'var(--color-text-muted)',
                          fontWeight: 300
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{inc.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <button
                  className={pkg.badge ? 'btn-primary' : 'btn-secondary'}
                  onClick={() => onReservePackage(pkg.id)}
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  Reserve Journey Package
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pkg-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-luxury-hover) !important;
          border-color: var(--color-gold-base) !important;
        }
        
        @media (max-width: 768px) {
          .packages-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
