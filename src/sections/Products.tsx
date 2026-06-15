import React from 'react';

const productsList = [
  {
    id: 'luminous-silk-cleanser',
    name: 'Luminous Silk Cleanser',
    category: 'Cleanser',
    price: 55.00,
    description: 'A silky, low-foaming medical cleanser infused with botanical extracts that removes impurities while respecting the skin barrier.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.40 AM.jpeg'
  },
  {
    id: 'cellular-hydration-serum',
    name: 'Cellular Hydration Serum',
    category: 'Serum',
    price: 85.00,
    description: 'A multi-weight hyaluronic acid serum designed to lock in deep hydration at the cellular level for a plump, glowing finish.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.41 AM (1).jpeg'
  },
  {
    id: 'restorative-barrier-cream',
    name: 'Restorative Barrier Cream',
    category: 'Moisturizer',
    price: 90.00,
    description: 'Intensive repair cream formulated with ceramides and clinical peptides to strengthen, soothe, and recover post-treatment skin.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.41 AM (2).jpeg'
  },
  {
    id: 'radiance-retinol-treatment',
    name: 'Radiance Retinol Treatment',
    category: 'Treatment',
    price: 110.00,
    description: 'Micro-encapsulated slow-release retinol that refines skin texture, accelerates cell turn-over, and diminishes fine lines.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.41 AM (3).jpeg'
  },
  {
    id: 'vitamin-c-glow-concentrate',
    name: 'Vitamin C Glow Concentrate',
    category: 'Serum',
    price: 95.00,
    description: 'Potent 15% L-Ascorbic Acid serum with Ferulic Acid to neutralize environmental free radicals and brighten uneven pigment.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.41 AM (4).jpeg'
  },
  {
    id: 'mineral-shield-spf-50',
    name: 'Mineral Shield SPF 50',
    category: 'Protection',
    price: 48.00,
    description: 'A lightweight, tinted physical sunscreen offering broad-spectrum protection with a flawless, dewy, non-greasy texture.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.41 AM (5).jpeg'
  },
  {
    id: 'absolute-eye-lift-gel',
    name: 'Absolute Eye Lift Gel',
    category: 'Eye Care',
    price: 75.00,
    description: 'Cooling peptide eye gel designed to drain puffiness, reduce dark circles, and lift structural lines around the orbital area.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.41 AM.jpeg'
  },
  {
    id: 'smoothing-exfoliating-polish',
    name: 'Smoothing Exfoliating Polish',
    category: 'Exfoliator',
    price: 50.00,
    description: 'Fine micro-polishing clinical scrub utilizing salicylic acid and quartz crystals to sweep away superficial build-up.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.42 AM (1).jpeg'
  },
  {
    id: 'clarifying-salicylic-elixir',
    name: 'Clarifying Salicylic Elixir',
    category: 'Treatment',
    price: 65.00,
    description: 'Targeted BHA toner that penetrates deep into pores to dissolve sebum, clear blackheads, and prevent active breakouts.',
    imageUrl: '/products/WhatsApp Image 2026-06-13 at 7.55.42 AM.jpeg'
  }
];

export default function Products() {
  React.useEffect(() => {
    // Scroll to top when loading the products page
    window.scrollTo(0, 0);
  }, []);

  return (
    <section id="products-showcase" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: '100vh', paddingTop: '160px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '80px' }}>
          <span className="section-subtitle">Exclusive Skincare</span>
          <h1 className="section-title" style={{ color: 'var(--color-text-light)' }}>
            LA Skin Product Collection
          </h1>
          <p className="section-description" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Extend your clinical skin outcomes at home. Explore our curated selection of high-potency, medical-grade formulations designed by Laura Andrade.
          </p>
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '40px'
        }}
        className="products-grid"
        >
          {productsList.map((product) => (
            <div
              key={product.id}
              className="glass-panel luxury-hover-card reveal-in active"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border-light)',
                position: 'relative'
              }}
            >
              {/* Product Category Badge */}
              <span style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(10, 10, 10, 0.85)',
                color: 'var(--color-gold-light)',
                border: '1px solid var(--color-border-light)',
                fontFamily: 'var(--font-sans)',
                fontSize: '9px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                zIndex: 10
              }}>
                {product.category}
              </span>

              {/* Product Image */}
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1', backgroundColor: '#161616' }}>
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 6s ease'
                  }}
                  className="product-card-image"
                />
                {/* Subtle dark overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 10, 10, 0.4) 0%, transparent 40%)'
                }} />
              </div>

              {/* Product Body */}
              <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flex: 1, color: 'var(--color-text-light)' }}>
                <h3 style={{ 
                  fontFamily: 'var(--font-serif)', 
                  fontSize: '22px', 
                  color: 'var(--color-text-light)', 
                  marginBottom: '10px', 
                  fontWeight: 400,
                  lineHeight: '1.2'
                }}>
                  {product.name}
                </h3>
                
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 300,
                  lineHeight: '1.6',
                  marginBottom: '24px',
                  flex: 1
                }}>
                  {product.description}
                </p>

                {/* Price and Inquire Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--color-border-light)',
                  paddingTop: '20px',
                  marginTop: 'auto'
                }}>
                  <span style={{ 
                    fontFamily: 'var(--font-sans)', 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'var(--color-gold-light)' 
                  }}>
                    ${product.price.toFixed(2)}
                  </span>
                  
                  <button 
                    style={{
                      background: 'var(--color-gold-gradient-soft)',
                      border: '1px solid var(--color-gold-base)',
                      color: 'var(--color-gold-light)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'default',
                      transition: 'var(--transition-fast)'
                    }}
                    className="product-btn"
                  >
                    Inquire at Clinic
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Future Expansion Disclaimer */}
        <div style={{
          marginTop: '80px',
          textAlign: 'center',
          backgroundColor: 'rgba(212, 175, 55, 0.05)',
          border: '1px dashed var(--color-border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          color: 'var(--color-text-light)'
        }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--color-gold-light)', marginBottom: '10px', fontWeight: 400 }}>
            eCommerce Integration Coming Soon
          </h4>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 300, maxWidth: '600px', margin: '0 auto' }}>
            We are currently structuring our online boutique for direct checkout. In the meantime, you can purchase all medical-grade formulations directly at our North Haven sanctuary during your next visit.
          </p>
        </div>
      </div>

      <style>{`
        .luxury-hover-card:hover .product-card-image {
          transform: scale(1.05);
        }
        .luxury-hover-card:hover .product-btn {
          background: var(--color-gold-gradient) !important;
          color: white !important;
        }
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
