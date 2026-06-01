import React, { useState } from 'react';

const treatmentsData = [
  {
    id: 'hydra-facial',
    name: 'Hydra Facial',
    tagline: 'Deep Vortex Hydration & Glow',
    category: 'facial',
    duration: '60 Mins',
    recovery: 'Zero downtime',
    price: '$225',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    description: 'A multi-step medical-grade skin treatment that cleanses, exfoliates, and extracts impurities while infusing skin with nourishing super-serums of antioxidants, peptides, and hyaluronic acid.',
    science: 'Deploying vortex-suction vacuum extraction, it removes sebum and dead cells from pores while pneumatic infusion saturates the skin cells with active serums, stimulating collagen synthesis.',
    steps: [
      'Clinical double cleansing and manual pore preparation',
      'Gentle mechanical peeling to sweep away superficial debris',
      'Pain-free vortex vacuum blackhead and debris extraction',
      'Deep serum infusion of clinical peptides, honey, and HA',
      'Finished with luxury Red LED light therapy to reduce redness'
    ]
  },
  {
    id: 'chemical-peel',
    name: 'Chemical Peel',
    tagline: 'Advanced Cellular Skin Resurfacing',
    category: 'therapy',
    duration: '45 Mins',
    recovery: '2 - 4 Days peeling',
    price: '$180',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
        <path d="M12 6V12L16 14" />
      </svg>
    ),
    description: 'A clinical skin-resurfacing procedure applying a custom concentration of alpha-hydroxy, beta-hydroxy, or trichloroacetic acids to remove damaged outer layers of skin.',
    science: 'The chemical solution causes controlled microscopic exfoliation. As the dead outer layers flake away, it triggers an intensive natural healing process, revealing fresh skin with improved pigment balance.',
    steps: [
      'Deep double cleansing and complete skin degreasing',
      'Application of customized clinical acid peel formulation',
      'Precise monitoring of skin reaction and activation',
      'Application of clinical neutralizing skin solution',
      'Infusion of medical barrier recovery moisturizers and mineral SPF'
    ]
  },
  {
    id: 'laser-treatment',
    name: 'Laser Treatment',
    tagline: 'Precision IPL Skin Rejuvenation',
    category: 'laser',
    duration: '50 Mins',
    recovery: '1 - 2 Days slight redness',
    price: '$350',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 3v1M12 20v1M3 12h1M20 12h1M18.364 5.636l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      </svg>
    ),
    description: 'Advanced fractional laser skin resurfacing and Intense Pulsed Light (IPL) treatments targeting deep pigment, spider veins, sun damage, and surgical scars.',
    science: 'Micro-beams of high-intensity laser energy penetrate below the epidermis, creating controlled microscopic thermal channels. This activates fibroblasts, triggering rapid production of fresh, new collagen fibers.',
    steps: [
      'Skin sanitization and placement of safety laser goggles',
      'Application of cool protective ultrasound gel layer',
      'Laser energy pulses systematically covering target areas',
      'Application of medical-grade soothing aloe gel overlay',
      'Finished with protective clinical cooling sheets and physical sunscreen'
    ]
  },
  {
    id: 'anti-aging',
    name: 'Anti-Aging Therapy',
    tagline: 'Sculpting Collagen Synthesis',
    category: 'therapy',
    duration: '75 Mins',
    recovery: 'Zero downtime',
    price: '$280',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M4.5 16.5C7.5 16.5 10 14 10 10.5C10 7 7.5 4.5 4.5 4.5" />
        <path d="M19.5 16.5C16.5 16.5 14 14 14 10.5C14 7 16.5 4.5 19.5 4.5" />
        <path d="M12 7v10" />
      </svg>
    ),
    description: 'A luxurious collagen-inducing treatment focusing on skin lifting, firming, and wrinkle plumping using custom-designed peptide cocktails and radiofrequency (RF) technology.',
    science: 'Controlled radiofrequency waves gently heat deep dermal tissue, forcing collagen fibers to instantly contract while signaling the body to produce fresh elastin and structural skin proteins.',
    steps: [
      'Cleansing and application of specialized RF conductive gel',
      'Symmetric RF thermal lifting covering jawline, cheeks, and forehead',
      'Infusion of medical-grade micro-encapsulated Retinol and peptides',
      'Sculpting pressure massage and botanical cold globe layout',
      'Application of intensive luxury biological collagen mask sheets'
    ]
  },
  {
    id: 'skin-rejuvenation',
    name: 'Skin Rejuvenation',
    tagline: 'Luminosity Cellular Restoration',
    category: 'laser',
    duration: '60 Mins',
    recovery: 'Zero downtime',
    price: '$240',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
    iconSvg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    description: 'A holistic botanical and technological fusion treatment aimed at detoxifying, replenishing, and infusing deep luminosity back into tired, dull, or environment-stressed skin.',
    science: 'Combines micro-needling or gentle microdermabrasion with targeted cellular growth factor infusions. It accelerates the natural rate of epidermal cell turnover, generating a radiant, high-gloss skin finish.',
    steps: [
      'Deep steam cleansing and enzymatic exfoliation scrub',
      'Gentle ultrasound skin scrub to extract surface sebum',
      'Infusion of high-purity Vitamin C, Ferulic Acid, and growth factors',
      'Acupressure face sculpting massage using cold botanical oils',
      'Clinical LED light therapy customized to your specific skin tone'
    ]
  }
];

export default function Treatments({ onBookTreatment }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  const filteredTreatments = activeFilter === 'all' 
    ? treatmentsData 
    : treatmentsData.filter(t => t.category === activeFilter);

  return (
    <section id="treatments" className="section" style={{ backgroundColor: '#FAF6F4' }}>
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
          {['all', 'facial', 'laser', 'therapy'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                border: activeFilter === filter ? '1px solid var(--color-gold-base)' : '1px solid var(--color-border-light)',
                background: activeFilter === filter ? 'var(--color-gold-gradient)' : 'white',
                color: activeFilter === filter ? 'white' : 'var(--color-text-dark)',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: activeFilter === filter ? '600' : '400',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: activeFilter === filter ? '0 4px 10px rgba(194, 155, 120, 0.2)' : 'none'
              }}
            >
              {filter === 'all' ? 'All Therapies' : filter === 'facial' ? 'Facial Clinic' : filter === 'laser' ? 'Laser Clinical' : 'Advanced Therapy'}
            </button>
          ))}
        </div>

        {/* Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '30px'
        }}
        className="treatments-grid"
        >
          {filteredTreatments.map((t) => (
            <div
              key={t.id}
              className="glass-panel luxury-hover-card reveal-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                height: '100%',
                backgroundColor: 'white'
              }}
            >
              {/* Card Image */}
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/10' }}>
                <img 
                  src={t.image} 
                  alt={t.name} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 6s ease'
                  }}
                  className="card-image"
                />
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
                  backgroundColor: 'rgba(250, 246, 244, 0.9)',
                  backdropFilter: 'blur(4px)',
                  color: 'var(--color-gold-dark)',
                  border: '1px solid var(--color-border-light)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '9px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {t.category === 'facial' ? 'Facial' : t.category === 'laser' ? 'Laser' : 'Therapy'}
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
                    {t.iconSvg}
                  </div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '0.05em', fontWeight: 500 }}>
                    {t.duration}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--color-text-dark)', marginBottom: '4px', fontWeight: 400 }}>
                  {t.name}
                </h3>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-gold-base)', letterSpacing: '0.05em', display: 'block', marginBottom: '16px', fontWeight: 500 }}>
                  {t.tagline}
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
                  {t.description.length > 120 ? `${t.description.substring(0, 120)}...` : t.description}
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
                    {t.price}
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
            backgroundColor: '#FAFAF9',
            boxShadow: '-10px 0 40px rgba(42, 36, 33, 0.15)',
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
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
              <img 
                src={selectedTreatment.image} 
                alt={selectedTreatment.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #FAFAF9 0%, transparent 60%)'
              }} />
            </div>

            {/* Panel Body Content */}
            <div style={{ padding: '0 40px 40px 40px', flex: 1 }}>
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
                backgroundColor: 'white',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Pricing</span>
                  <strong style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-text-dark)' }}>{selectedTreatment.price}</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--color-border-light)', borderRight: '1px solid var(--color-border-light)' }}>
                  <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Duration</span>
                  <strong style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-text-dark)' }}>{selectedTreatment.duration}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Recovery</span>
                  <strong style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-dark)' }}>{selectedTreatment.recovery}</strong>
                </div>
              </div>

              {/* Description */}
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 600 }}>
                Procedural Overview
              </h4>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 300, lineHeight: '1.7', marginBottom: '24px' }}>
                {selectedTreatment.description}
              </p>

              {/* Science clinical detail */}
              <div style={{
                backgroundColor: 'white',
                borderLeft: '3px solid var(--color-gold-base)',
                padding: '16px 20px',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                marginBottom: '32px'
              }}>
                <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-gold-dark)', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>
                  Scientific Rationale
                </h5>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 300, lineHeight: '1.6' }}>
                  {selectedTreatment.science}
                </p>
              </div>

              {/* Step by step procedure */}
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.1em', marginBottom: '14px', fontWeight: 600 }}>
                Step-by-Step Experience
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                {selectedTreatment.steps.map((stepText, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '13px', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontWeight: 300 }}>
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
                      {idx + 1}
                    </span>
                    <span style={{ lineHeight: '1.5' }}>{stepText}</span>
                  </li>
                ))}
              </ul>

              {/* Book Button */}
              <button 
                className="btn-primary" 
                onClick={() => {
                  setSelectedTreatment(null);
                  onBookTreatment(selectedTreatment.name);
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
