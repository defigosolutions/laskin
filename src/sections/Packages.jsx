import React from 'react';

const packages = [
  {
    id: 'bh-radiance',
    name: 'The Beverly Hills Radiance',
    tagline: 'Instant Event High-Gloss Glow',
    price: '$320',
    valuePrice: '$385 Value',
    badge: 'Bestseller',
    includes: [
      '60 Min Hydra Facial Luxe infusion',
      'Purity Vitamin C & Ferulic infusion',
      'Clinical Red LED light therapy calm',
      'Luxury botanical face lift massage'
    ]
  },
  {
    id: 'london-classic',
    name: 'The London Glow Classic',
    tagline: 'Deep Resurfacing & Pore Clearing',
    price: '$360',
    valuePrice: '$420 Value',
    badge: null,
    includes: [
      '45 Min Glycolic Chemical Peel',
      'Targeted Vortex Sebum extraction',
      'Pneumatic Hyaluronic hydration lock',
      'Medical barrier repair massage'
    ]
  },
  {
    id: 'dubai-elite',
    name: 'The Dubai Elite Restorative',
    tagline: 'Total Dermal Cellular Regeneration',
    price: '$550',
    valuePrice: '$630 Value',
    badge: 'Elite Choice',
    includes: [
      'Full Precision Laser IPL treatment',
      'Radiofrequency Collagen contractions',
      'Intensive cellular growth factor mask',
      'Bespoke luxury peptide cold stone massage'
    ]
  }
];

export default function Packages({ onReservePackage }) {
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

        {/* Packages Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '30px',
          alignItems: 'stretch'
        }}
        className="packages-grid"
        >
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="glass-panel reveal-in"
              style={{
                padding: '50px 40px',
                backgroundColor: pkg.badge ? 'rgba(255, 255, 255, 0.95)' : 'white',
                border: pkg.badge ? '2px solid var(--color-gold-base)' : '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'var(--transition-smooth)'
              }}
              className="pkg-card"
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
                  {pkg.tagline}
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
                  {pkg.price}
                </span>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  textDecoration: 'line-through',
                  letterSpacing: '0.05em',
                  marginTop: '4px',
                  display: 'block'
                }}>
                  {pkg.valuePrice}
                </span>
              </div>

              {/* Includes checklist */}
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
                
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pkg.includes.map((inc, idx) => (
                    <li key={idx} style={{
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
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                className={pkg.badge ? 'btn-primary' : 'btn-secondary'}
                onClick={() => onReservePackage(pkg.name)}
                style={{ width: '100%' }}
              >
                Reserve Journey Package
              </button>
            </div>
          ))}
        </div>
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
