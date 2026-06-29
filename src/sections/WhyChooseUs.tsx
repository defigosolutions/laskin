import React from 'react';

const reasons = [
  {
    id: 1,
    title: 'Elite Expertise',
    description: 'Our treatments are curated and performed by elite aestheticians with advanced training in Beverly Hills, London, and Dubai.',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5">
        <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
        <path d="M6 19v2h12v-2a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4z" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'Advanced Aesthetic Tech',
    description: 'We deploy only premium, clinically audited diagnostic scanners, laser systems, and radiofrequency devices, ensuring zero-compromise safety and maximum efficacy.',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'Cellular-Level Mapping',
    description: 'We do not believe in one-size-fits-all treatments. Every facial structure receives high-fidelity diagnostic scanning to map structural concerns at the cellular layer.',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'Ultra-Private Luxury Suites',
    description: 'Relax in fully isolated, acoustically dampened treatment suites finished in premium blush-pink and gold detailing. Your privacy and clinical safety are our absolute priority.',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  }
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="section" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAFAFA" />
            <stop offset="100%" stopColor="#A1A1AA" />
          </linearGradient>
        </defs>
      </svg>

      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Our Standards</span>
          <h2 className="section-title">The Benchmark of Aesthetic Care</h2>
          <p className="section-description">
            Experience skin wellness engineered at the intersection of advanced skincare, precise expertise, and absolute luxury.
          </p>
        </div>

        {/* Benefits Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '30px'
        }}
        className="why-grid"
        >
          {reasons.map((r) => (
            <div
              key={r.id}
              className="glass-panel luxury-hover-card reveal-in"
              style={{
                padding: '40px 32px',
                textAlign: 'center',
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Icon container */}
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-luxury)'
              }}
              className="reason-icon-box"
              >
                {r.iconSvg}
              </div>

              {/* Reason Title */}
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: 'var(--color-text-dark)',
                marginBottom: '14px',
                fontWeight: 400
              }}>
                {r.title}
              </h3>

              {/* Reason Description */}
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                fontWeight: 300,
                lineHeight: '1.7'
              }}>
                {r.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .luxury-hover-card:hover .reason-icon-box {
          border-color: var(--color-gold-base) !important;
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(194, 155, 120, 0.2) !important;
        }
        
        @media (max-width: 768px) {
          .why-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
