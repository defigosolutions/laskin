import React from 'react';

export default function Hero({ onBookingClick }) {
  const handleScrollToTreatments = (e) => {
    e.preventDefault();
    const targetElement = document.querySelector('#treatments');
    if (targetElement) {
      const offset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(rgba(42, 36, 33, 0.45), rgba(42, 36, 33, 0.25)), url("https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1920&auto=format&fit=crop") no-repeat center center / cover',
        color: 'white',
        padding: '120px 0 80px 0',
        zIndex: 5,
        overflow: 'hidden'
      }}
    >
      {/* Decorative luxury overlay lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 70% 30%, rgba(246, 230, 227, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '680px' }} className="reveal-in">
          {/* Subtle luxurious tagline */}
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: 'var(--color-gold-light)',
            fontWeight: '600',
            display: 'block',
            marginBottom: '18px'
          }}>
            Beverly Hills • London • Dubai
          </span>

          {/* Grand elegant heading */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'calc(38px + 2vw)',
            fontWeight: '300',
            lineHeight: '1.15',
            color: '#FFFFFF',
            marginBottom: '24px',
            textShadow: '0 2px 10px rgba(42, 36, 33, 0.2)'
          }}>
            Elevate Your <br />
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: '400', color: 'var(--color-gold-light)' }}>
              Natural Radiance
            </span>
          </h1>

          {/* Luxury descriptive subtitle */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: '300',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            maxWidth: '560px'
          }}>
            Experience world-class skin health and aesthetic treatments in our state-of-the-art medical spas. Bespoke care tailored to illuminate your timeless beauty.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              onClick={onBookingClick}
              style={{ padding: '16px 36px', fontSize: '12px' }}
            >
              Book Priority Visit
            </button>
            <button 
              className="btn-secondary" 
              onClick={handleScrollToTreatments}
              style={{ 
                padding: '15px 35px', 
                fontSize: '12px',
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.6)'
              }}
              className="hero-btn-sec"
            >
              Explore Treatments
            </button>
          </div>
        </div>
        
        {/* Floating details panel */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          right: '24px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 32px',
          display: 'flex',
          gap: '40px',
          boxShadow: 'var(--shadow-luxury)',
          transform: 'translateY(0)'
        }}
        className="desktop-only hero-floating-box"
        >
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-gold-light)' }}>99%</h4>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Satisfaction</span>
          </div>
          <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-gold-light)' }}>15k+</h4>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Clients Served</span>
          </div>
          <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-gold-light)' }}>10+</h4>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Elite Specialists</span>
          </div>
        </div>
      </div>

      <style>{`
        .hero-btn-sec:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-color: white !important;
        }
        
        @media (max-width: 1024px) {
          .hero-floating-box {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
