import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { publicApi } from '../lib/api';

export default function Footer({ onBookingClick }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
      try {
        await publicApi.subscribeNewsletter(email);
        setSubmitted(true);
        setEmail('');
      } catch (err) {
        console.error('Newsletter subscribe error:', err);
      }
    }
  };

  const handleLinkClick = (e, href) => {
    if (window.location.pathname !== '/') {
      window.location.href = '/' + href;
      return;
    }
    e.preventDefault();
    const targetElement = document.querySelector(href);
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
    <footer style={{
      backgroundColor: 'var(--color-bg-dark)',
      color: 'rgba(255, 255, 255, 0.75)',
      padding: '80px 0 40px 0',
      borderTop: '1px solid var(--color-border-strong)',
      fontFamily: 'var(--font-sans)',
      position: 'relative'
    }}>
      <div className="container">
        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1.2fr',
          gap: '50px',
          marginBottom: '60px'
        }}
        className="footer-grid"
        >
          {/* Col 1: Large Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} className="footer-col-brand">
            <Link to="/" onClick={(e) => handleLinkClick(e, '#')} style={{ display: 'block' }}>
              <Logo variant="vertical" height={56} className="footer-logo-override" />
            </Link>
            <p style={{
              fontSize: '13px',
              fontWeight: 300,
              lineHeight: '1.8',
              color: 'rgba(255, 255, 255, 0.6)',
              marginTop: '20px',
              maxWidth: '280px'
            }}>
              A premium clinical merger of medical diagnostics and five-star relaxation. Radiate your natural energy.
            </p>
            <p style={{
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '1.6',
              color: 'var(--color-gold-light)',
              marginTop: '16px',
              maxWidth: '280px',
              fontStyle: 'normal'
            }}>
              132 Middletown Ave Suite 10<br />
              North Haven, CT 06473
            </p>
          </div>

          {/* Col 2: Services Directory */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--color-gold-light)',
              marginBottom: '24px'
            }}>
              Therapies
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', fontWeight: 300 }}>
              <li><a href="#treatments" onClick={(e) => handleLinkClick(e, '#treatments')} className="footer-link">Hydrafacial</a></li>
              <li><a href="#treatments" onClick={(e) => handleLinkClick(e, '#treatments')} className="footer-link">Basic Facial Cleansing</a></li>
              <li><a href="#treatments" onClick={(e) => handleLinkClick(e, '#treatments')} className="footer-link">Advanced Skin Treatments</a></li>
              <li><a href="#treatments" onClick={(e) => handleLinkClick(e, '#treatments')} className="footer-link">Laser Hair Removal</a></li>
            </ul>
          </div>

          {/* Col 3: Company Links */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--color-gold-light)',
              marginBottom: '24px'
            }}>
              Sanctuary
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', fontWeight: 300 }}>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, '#about')} className="footer-link">About Clinic</a></li>
              <li><a href="#why-us" onClick={(e) => handleLinkClick(e, '#why-us')} className="footer-link">Why Choose Us</a></li>
              <li><a href="#specialists" onClick={(e) => handleLinkClick(e, '#specialists')} className="footer-link">Specialist</a></li>
              <li><a href="#packages" onClick={(e) => handleLinkClick(e, '#packages')} className="footer-link">Packages</a></li>
              <li><Link to="/products" className="footer-link">Products Showcase</Link></li>
              <li><a href="#contact" onClick={(e) => handleLinkClick(e, '#contact')} className="footer-link">Direct Contacts</a></li>
            </ul>
          </div>

          {/* Col 4: Bulletins Newsletter */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--color-gold-light)',
              marginBottom: '18px'
            }}>
              Concierge Bulletins
            </h4>
            <p style={{ fontSize: '13px', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '20px' }}>
              Subscribe to receive updates on advanced procedures and private branch invitation events.
            </p>

            {submitted ? (
              <div style={{
                padding: '12px 16px',
                border: '1px solid var(--color-gold-base)',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--color-gold-light)',
                fontFamily: 'var(--font-sans)'
              }}>
                Thank you. You have been added to our priority registry.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  required
                  placeholder="alexandra@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    fontSize: '13px',
                    fontFamily: 'var(--font-sans)',
                    transition: 'var(--transition-fast)'
                  }}
                  className="footer-input"
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--color-gold-base)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  className="footer-sub-btn"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Separator line */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '40px' }} />

        {/* Bottom copyright details */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.45)'
        }}
        className="footer-bottom"
        >
          <span>© {new Date().getFullYear()} LA Skin & Aesthetics. All Rights Reserved.</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span>Developed by <a href="https://bluetelecast.com/" target="_blank" rel="noopener noreferrer" className="footer-link-bottom" style={{ color: 'inherit' }}>Bluetelecast</a></span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--color-gold-light)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                transition: 'var(--transition-fast)'
              }}
              className="move-to-top-btn"
            >
              Move to Top ↑
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* Modify footer logo styles to contrast white on dark background */
        .footer-logo-override h2, 
        .footer-logo-override h3 {
          color: white !important;
        }
        .footer-logo-override span {
          color: var(--color-gold-light) !important;
        }
        
        .footer-link {
          color: rgba(255, 255, 255, 0.6) !important;
          transition: var(--transition-fast);
          text-decoration: none;
        }
        .footer-link:hover {
          color: var(--color-gold-light) !important;
          padding-left: 4px;
        }
        
        .footer-input:focus {
          border-color: var(--color-gold-base) !important;
          background-color: rgba(255,255,255,0.08) !important;
        }
        
        .footer-sub-btn:hover {
          background-color: var(--color-gold-dark) !important;
        }
        
        .footer-link-bottom {
          color: rgba(255, 255, 255, 0.4) !important;
          text-decoration: none;
        }
        .footer-link-bottom:hover {
          color: var(--color-gold-light) !important;
        }

        .move-to-top-btn:hover {
          background-color: var(--color-gold-base) !important;
          color: white !important;
          border-color: var(--color-gold-base) !important;
        }
        
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }
          .footer-col-brand {
            grid-column: span 2;
            align-items: center !important;
            text-align: center;
          }
          .footer-col-brand p {
            max-width: 100% !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-col-brand {
            grid-column: span 1;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
