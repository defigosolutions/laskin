import React from 'react';
import { usePublicSiteSettings } from '../hooks/usePublicApi';

export default function Hero({ onBookingClick }) {
  const { data: settings } = usePublicSiteSettings();

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

  const heroBgImage = settings?.heroBgImageUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1920&auto=format&fit=crop";
  const heroTitle = settings?.heroTitle || "Elevate Your <br /> <span style='font-family: var(--font-serif); font-style: italic; font-weight: 400; color: var(--color-gold-base)'>Natural Radiance</span>";
  const heroSubtitle = settings?.heroSubtitle || "Experience world-class skin health and aesthetic treatments in our state-of-the-art medical spa. Bespoke care tailored to illuminate your timeless beauty.";

  return (
    <section 
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.45)), url("${heroBgImage}") no-repeat center center / cover`,
        color: 'var(--color-text-light)',
        padding: '120px 0 80px 0',
        zIndex: 5,
        overflow: 'hidden'
      }}
    >
      {/* Decorative luxury overlay lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 70% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '680px' }} className="reveal-in active">
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
            North Haven, CT
          </span>

          {/* Grand elegant heading */}
          <h1 
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'calc(38px + 2vw)',
              fontWeight: '300',
              lineHeight: '1.15',
              color: 'var(--color-text-light)',
              marginBottom: '24px',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}
            dangerouslySetInnerHTML={{ __html: heroTitle }}
          />

          {/* Luxury descriptive subtitle */}
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            fontWeight: '300',
            lineHeight: '1.8',
            color: 'rgba(255, 255, 255, 0.75)',
            marginBottom: '40px',
            maxWidth: '560px'
          }}>
            {heroSubtitle}
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
              className="btn-secondary hero-btn-sec" 
              onClick={handleScrollToTreatments}
              style={{ 
                padding: '15px 35px', 
                fontSize: '12px',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'var(--color-text-light)'
              }}
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
          background: 'var(--color-glass-dark)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 32px',
          display: 'flex',
          gap: '40px',
          boxShadow: 'var(--shadow-luxury)',
          transform: 'translateY(0)'
        }}
        className="desktop-only hero-floating-box"
        >
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-gold-base)', fontWeight: 400 }}>99%</h4>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, color: 'var(--color-text-light)' }}>Satisfaction</span>
          </div>
          <div style={{ width: '1px', background: 'var(--color-border-light)' }} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-gold-base)', fontWeight: 400 }}>15k+</h4>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, color: 'var(--color-text-light)' }}>Clients Served</span>
          </div>
          <div style={{ width: '1px', background: 'var(--color-border-light)' }} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-gold-base)', fontWeight: 400 }}>13+</h4>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, color: 'var(--color-text-light)' }}>Yrs Experience</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-floating-box {
            display: none !important;
          }
        }
        .hero-btn-sec:hover {
          color: var(--color-gold-base) !important;
          border-color: var(--color-gold-base) !important;
        }
      `}</style>
    </section>
  );
}
