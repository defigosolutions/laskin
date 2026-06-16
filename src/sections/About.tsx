import React from 'react';
import { usePublicSiteSettings } from '../hooks/usePublicApi';

export default function About() {
  const { data: settings } = usePublicSiteSettings();

  const aboutImage = settings?.aboutImageUrl || "/images/hero/about_bg.jpg";
  const aboutTitle = settings?.aboutTitle || "A Heritage of Rejuvenation & Timeless Harmony";
  const aboutDescription1 = settings?.aboutDescription1 || "Founded in Beverly Hills and expanded to global luxury destinations in London and Dubai, <strong>LA Skin & Aesthetics</strong> combines cutting-edge clinical technology with a serene, high-society medical spa atmosphere.";
  const aboutDescription2 = settings?.aboutDescription2 || "Our clinical philosophy centers around custom anatomical skin mapping, focusing on restoring optimal cellular health and highlighting your natural features without looking artificial or overdone.";

  return (
    <section id="about" className="section" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Subtle leaf background graphic overlay */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '-50px',
        width: '300px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 80%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '80px',
          alignItems: 'center'
        }}
        className="about-grid"
        >
          {/* Visual Column */}
          <div style={{ position: 'relative' }} className="reveal-in active">
            {/* Elegant double border offset */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '100%',
              height: '100%',
              border: '1px solid var(--color-gold-base)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 1,
              pointerEvents: 'none'
            }} />
            
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-luxury)',
              zIndex: 2,
              aspectRatio: '4/5'
            }}>
              <img 
                src={aboutImage} 
                alt="LA Skin & Aesthetics treatment experience" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 8s ease'
                }}
                className="about-image"
              />
            </div>
            
            {/* Floating Luxury Tag */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '-20px',
              background: 'var(--color-glass-white)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--color-border-strong)',
              boxShadow: 'var(--shadow-luxury)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 24px',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            className="desktop-only float-animation"
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--color-gold-gradient)'
              }} />
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '15px',
                color: 'var(--color-text-dark)',
                fontWeight: 500,
                letterSpacing: '0.05em'
              }}>
                Medical Grade Standards
              </span>
            </div>
          </div>

          {/* Copy Column */}
          <div className="reveal-in active" style={{ animationDelay: '0.2s' }}>
            <span className="section-subtitle">About Our Clinic</span>
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              {aboutTitle}
            </h2>
            
            <p 
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 300,
                lineHeight: '1.8',
                color: 'var(--color-text-muted)',
                marginBottom: '24px'
              }}
              dangerouslySetInnerHTML={{ __html: aboutDescription1 }}
            />

            <p 
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                fontWeight: 300,
                lineHeight: '1.8',
                color: 'var(--color-text-muted)',
                marginBottom: '36px'
              }}
              dangerouslySetInnerHTML={{ __html: aboutDescription2 }}
            />

            {/* Structured Pillars */}
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--color-gold-gradient-soft)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-dark)" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Bespoke Treatment Mapping
                  </h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 300 }}>
                    Every client receives a comprehensive skin-cell diagnostic analysis to map out a precise wellness journey.
                  </p>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  background: 'var(--color-gold-gradient-soft)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-dark)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    State-of-the-Art Science
                  </h4>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 300 }}>
                    We exclusively deploy FDA-approved, medical-grade technologies and premium clinically researched serums.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .about-image:hover {
          transform: scale(1.05);
        }
        
        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
        }
      `}</style>
    </section>
  );
}
