import React, { useState } from 'react';

const branchSanctuaries = [
  {
    id: 'bh',
    city: 'Beverly Hills',
    address: '420 Rodeo Drive, Suite A, Beverly Hills, CA 90210',
    phone: '+1 (310) 555-0190',
    email: 'bh@laskinclinic.com',
    hours: 'Mon - Fri: 9:00 AM - 8:00 PM | Sat: 10:00 AM - 6:00 PM',
    mapCoords: { x: '25%', y: '45%' }
  },
  {
    id: 'ldn',
    city: 'London',
    address: '18 Bruton Place, Mayfair, London W1J 6LY',
    phone: '+44 (20) 7946 0981',
    email: 'mayfair@laskinclinic.com',
    hours: 'Mon - Fri: 9:00 AM - 8:00 PM | Sat: 10:00 AM - 5:00 PM',
    mapCoords: { x: '50%', y: '35%' }
  },
  {
    id: 'dxb',
    city: 'Dubai',
    address: 'Burj Plaza, Downtown Suite 44, Dubai, UAE',
    phone: '+971 (4) 420 0199',
    email: 'dubai@laskinclinic.com',
    hours: 'Mon - Sat: 10:00 AM - 9:00 PM | Sun: Closed',
    mapCoords: { x: '75%', y: '55%' }
  }
];

export default function Contact() {
  const [activeBranch, setActiveBranch] = useState('bh');

  const selectedBranch = branchSanctuaries.find(b => b.id === activeBranch);

  return (
    <section id="contact" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Background visual shapes */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(246, 230, 227, 0.3) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Locations</span>
          <h2 className="section-title">Our Global Sanctuaries</h2>
          <p className="section-description">
            Visit us in the world's most exclusive luxury districts. Schedule a consultation or reach out to our concierge services for priority assistance.
          </p>
        </div>

        {/* Contact Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center'
        }}
        className="contact-grid"
        >
          {/* Column 1: Addresses & Info */}
          <div className="reveal-in">
            {/* Branch selector buttons */}
            <div style={{
              display: 'flex',
              backgroundColor: 'white',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '6px',
              gap: '6px',
              marginBottom: '36px'
            }}>
              {branchSanctuaries.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBranch(b.id)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: activeBranch === b.id ? 'var(--color-gold-gradient)' : 'transparent',
                    color: activeBranch === b.id ? 'white' : 'var(--color-text-dark)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: activeBranch === b.id ? '600' : '400',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {b.city}
                </button>
              ))}
            </div>

            {/* Selected Branch Detail Card */}
            <div 
              key={selectedBranch.id}
              className="glass-panel"
              style={{
                padding: '40px',
                backgroundColor: 'white',
                animation: 'fadeIn 0.5s ease-in-out forwards'
              }}
            >
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'var(--color-gold-base)',
                fontWeight: 600,
                display: 'block',
                marginBottom: '8px'
              }}>
                {selectedBranch.city} Sanctuary
              </span>
              
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '32px',
                color: 'var(--color-text-dark)',
                marginBottom: '28px',
                fontWeight: 400
              }}>
                LA Skin & Aesthetics
              </h3>

              {/* Grid of contact details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Address</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-dark)', fontWeight: 400 }}>
                      {selectedBranch.address}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Priority Lines</span>
                    <a href={`tel:${selectedBranch.phone}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-dark)', fontWeight: 500 }} className="contact-link">
                      {selectedBranch.phone}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Concierge Email</span>
                    <a href={`mailto:${selectedBranch.email}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-dark)', fontWeight: 500 }} className="contact-link">
                      {selectedBranch.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Hours of Reception</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 300, lineHeight: '1.4', display: 'block', marginTop: '2px' }}>
                      {selectedBranch.hours}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Stylized Luxury Map */}
          <div className="reveal-in" style={{ animationDelay: '0.2s' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-strong)',
              boxShadow: 'var(--shadow-luxury)',
              overflow: 'hidden',
              background: '#FAF0EB',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* Stylized custom map canvas drawing using pure CSS grids and vectors */}
              {/* Grid Lines representing map coordinates */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(194, 155, 120, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(194, 155, 120, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
                pointerEvents: 'none'
              }} />

              {/* Decorative abstract land masses */}
              <div style={{
                position: 'absolute',
                width: '180px',
                height: '100px',
                top: '20%',
                left: '15%',
                backgroundColor: 'white',
                filter: 'blur(30px)',
                borderRadius: '50%',
                opacity: 0.8,
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                width: '240px',
                height: '140px',
                bottom: '25%',
                right: '10%',
                backgroundColor: 'white',
                filter: 'blur(40px)',
                borderRadius: '50%',
                opacity: 0.9,
                pointerEvents: 'none'
              }} />

              {/* Vector Lines representing map routing */}
              <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', stroke: 'var(--color-gold-light)', strokeWidth: '0.8', strokeDasharray: '3 5' }}>
                <path d="M 120,162 L 240,126 L 360,198" fill="none" />
              </svg>

              {/* Branch Markers (interactive) */}
              {branchSanctuaries.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setActiveBranch(b.id)}
                  style={{
                    position: 'absolute',
                    left: b.mapCoords.x,
                    top: b.mapCoords.y,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {/* Outer breathing ring */}
                  <div style={{
                    position: 'absolute',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(194, 155, 120, 0.25)',
                    animation: activeBranch === b.id ? 'pulse-gold 2s infinite' : 'none',
                    pointerEvents: 'none'
                  }} />
                  
                  {/* Pin Point */}
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: activeBranch === b.id ? 'var(--color-gold-gradient)' : 'white',
                    border: '2px solid var(--color-gold-base)',
                    boxShadow: '0 2px 8px rgba(42, 36, 33, 0.2)',
                    transition: 'var(--transition-smooth)'
                  }} />

                  {/* Branch Tag Label */}
                  <span style={{
                    marginTop: '8px',
                    backgroundColor: activeBranch === b.id ? 'var(--color-text-dark)' : 'white',
                    color: activeBranch === b.id ? 'white' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border-light)',
                    fontSize: '9px',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: '600',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-luxury)',
                    transition: 'var(--transition-smooth)'
                  }}>
                    {b.city}
                  </span>
                </div>
              ))}

              {/* Map Tag Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(4px)',
                border: '1px solid var(--color-border-light)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '9px',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)'
              }}>
                Sanctuary Locator Grid
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-gold {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        
        .contact-link:hover {
          color: var(--color-gold-dark) !important;
          text-decoration: underline;
        }
        
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
        }
      `}</style>
    </section>
  );
}
