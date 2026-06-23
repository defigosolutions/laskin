import React, { useState } from 'react';
import { usePublicProducts } from '../hooks/usePublicApi';
import { publicApi } from '../lib/api';

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

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  React.useEffect(() => {
    // Scroll to top when loading the products page
    window.scrollTo(0, 0);
  }, []);

  const handleInquireClick = (product: any) => {
    setSelectedProduct(product);
    setSubmitStatus(null);
    setFormData({ fullName: '', email: '', phone: '' });
    setIsModalOpen(true);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await publicApi.submitProductInquiry({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        productId: selectedProduct.id,
        message: `I am interested in purchasing ${selectedProduct.name}. Please contact me regarding pricing and availability.`
      });
      
      setSubmitStatus({
        type: 'success',
        message: 'Your inquiry has been sent! We will contact you shortly.'
      });
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsModalOpen(false);
      }, 3000);
      
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send inquiry. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    onClick={() => handleInquireClick(product)}
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
                      cursor: 'pointer',
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

      {/* Inquiry Modal */}
      {isModalOpen && selectedProduct && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-dark)',
            border: '1px solid var(--color-gold-base)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '450px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: '20px',
                zIndex: 10
              }}
            >
              ×
            </button>
            
            <div style={{ padding: '30px' }}>
              <h3 style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '24px', 
                color: 'var(--color-gold-light)',
                marginBottom: '8px',
                fontWeight: 400
              }}>
                Product Inquiry
              </h3>
              <p style={{ 
                fontFamily: 'var(--font-sans)', 
                fontSize: '13px', 
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '24px'
              }}>
                Interested in <strong>{selectedProduct.name}</strong>? Leave your details below and our concierge will contact you.
              </p>

              {submitStatus ? (
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: submitStatus.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                  border: `1px solid ${submitStatus.type === 'success' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}`,
                  color: submitStatus.type === 'success' ? '#81c784' : '#e57373',
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans)'
                }}>
                  {submitStatus.message}
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-gold-base)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-gold-base)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Email Address *</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-gold-base)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Mobile No *</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      marginTop: '8px',
                      background: 'var(--color-gold-gradient)',
                      color: 'var(--color-bg-primary)',
                      border: 'none',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .luxury-hover-card:hover .product-card-image {
          transform: scale(1.05) !important;
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
