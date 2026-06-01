import React, { useState, useEffect } from 'react';

const reviews = [
  {
    id: 1,
    quote: "The most outstanding skin results I have ever experienced. After just one Hydra Facial Luxe session in the London Mayfair suite, my skin looked incredibly plump and radiant for my entire wedding week. The privacy and luxury care are completely unparalleled.",
    author: "Lady Beatrice V.",
    location: "London (Mayfair)",
    rating: 5
  },
  {
    id: 2,
    quote: "Dr. Davenport’s bespoke treatment mapping protocol is a miracle. She analyzed my skin structure at the cell level and designed a laser resurfacing timeline that completely swept away years of sun damage. The Beverly Hills clinic is exceptional.",
    author: "Charlotte R.",
    location: "Beverly Hills (Rodeo Dr)",
    rating: 5
  },
  {
    id: 3,
    quote: "Absolutely unmatched prestige and scientific excellence. The Dubai Downtown branch has become my monthly sanctuary. The anti-aging therapies and structural sculpting are state-of-the-art and deliver natural-looking longevity.",
    author: "Yasmin Al-M.",
    location: "Dubai (Downtown)",
    rating: 5
  }
];

export default function Reviews() {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Auto slide every 8 seconds
  useEffect(() => {
    const timer = setInterval(handleNext, 8000);
    return () => clearInterval(timer);
  }, []);

  const renderStars = (count) => (
    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '24px' }}>
      {[...Array(count)].map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="var(--color-gold-base)" stroke="var(--color-gold-base)" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );

  return (
    <section id="reviews" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Background visual graphics */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        right: '-50px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(246, 230, 227, 0.4) 0%, transparent 80%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <span className="section-subtitle">Whispers of Satisfaction</span>
          <h2 className="section-title">Client Testimonials</h2>
        </div>

        {/* Testimonial Carousel Frame */}
        <div style={{
          maxWidth: '850px',
          margin: '0 auto',
          position: 'relative',
          padding: '0 60px'
        }}
        className="carousel-frame"
        >
          {/* Main content viewport */}
          <div style={{ minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {reviews.map((r, idx) => (
              <div
                key={r.id}
                style={{
                  display: activeIdx === idx ? 'block' : 'none',
                  textAlign: 'center',
                  animation: activeIdx === idx ? 'fadeIn 0.6s ease-in-out' : 'none'
                }}
              >
                {/* Gold Stars */}
                {renderStars(r.rating)}

                {/* Big luxury quote mark */}
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '90px',
                  color: 'var(--color-gold-base)',
                  lineHeight: '0',
                  display: 'block',
                  height: '24px',
                  marginBottom: '10px',
                  opacity: 0.3
                }}>
                  “
                </span>

                {/* Testimonial Quote */}
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '22px',
                  fontStyle: 'italic',
                  lineHeight: '1.8',
                  color: 'var(--color-text-dark)',
                  fontWeight: 300,
                  marginBottom: '28px',
                  maxWidth: '700px',
                  margin: '0 auto 28px auto'
                }}
                className="review-quote-text"
                >
                  {r.quote}
                </p>

                {/* Testimonial Author & Branch */}
                <div>
                  <h4 style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--color-text-dark)',
                    marginBottom: '4px'
                  }}>
                    {r.author}
                  </h4>
                  
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    color: 'var(--color-gold-dark)',
                    letterSpacing: '0.08em',
                    fontWeight: 500
                  }}>
                    {r.location}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Trigger */}
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid var(--color-border-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-dark)',
              boxShadow: 'var(--shadow-luxury)',
              transition: 'var(--transition-fast)'
            }}
            className="carousel-btn btn-left"
            aria-label="Previous review"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Right Arrow Trigger */}
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: '1px solid var(--color-border-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-dark)',
              boxShadow: 'var(--shadow-luxury)',
              transition: 'var(--transition-fast)'
            }}
            className="carousel-btn btn-right"
            aria-label="Next review"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Carousel Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
          {reviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              style={{
                width: activeIdx === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeIdx === idx ? 'var(--color-gold-base)' : 'var(--color-border-strong)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .carousel-btn:hover {
          background-color: var(--color-gold-gradient-soft) !important;
          color: var(--color-gold-dark) !important;
          border-color: var(--color-gold-base) !important;
          transform: translateY(-50%) scale(1.05) !important;
        }
        
        @media (max-width: 768px) {
          .carousel-frame {
            padding: 0 !important;
          }
          .carousel-btn {
            display: none !important;
          }
          .review-quote-text {
            font-size: 17px !important;
          }
        }
      `}</style>
    </section>
  );
}
