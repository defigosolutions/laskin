import React from 'react';
import { usePublicProducts } from '../hooks/usePublicApi';

// Helper to resolve images (especially local uploads)
export const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) {
    const base = import.meta.env.DEV ? 'http://localhost:4000' : '';
    return `${base}${url}`;
  }
  return url;
};

export default function Products() {
  const { data: productsList, isLoading, isError } = usePublicProducts();

  React.useEffect(() => {
    // Scroll to top when loading the products page
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <section id="products-showcase" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: '100vh', paddingTop: '160px', color: 'var(--color-text-light)', textAlign: 'center' }}>
        <div className="container">Loading product collection...</div>
      </section>
    );
  }

  if (isError || !productsList) {
    return (
      <section id="products-showcase" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: '100vh', paddingTop: '160px', color: 'red', textAlign: 'center' }}>
        <div className="container">Failed to load products. Please try again.</div>
      </section>
    );
  }

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
                {product.tagline}
              </span>

              {/* Product Image */}
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1', backgroundColor: '#161616' }}>
                <img 
                  src={resolveImageUrl(product.imageUrl || product.image_url)} 
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
                    ${((product.priceCents || product.price_cents) / 100).toFixed(2)}
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
