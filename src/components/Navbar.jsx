import React, { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Navbar({ onBookingClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Treatments', href: '#treatments' },
    { label: 'Before & After', href: '#gallery' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Specialists', href: '#specialists' },
    { label: 'Packages', href: '#packages' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const offset = 80; // height of the navbar
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: isScrolled ? '75px' : '95px',
        background: isScrolled ? 'rgba(250, 246, 244, 0.92)' : 'rgba(250, 246, 244, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isScrolled ? '1px solid rgba(194, 155, 120, 0.15)' : '1px solid transparent',
        boxShadow: isScrolled ? '0 10px 30px rgba(42, 36, 33, 0.03)' : 'none',
        display: 'flex',
        alignItems: 'center',
        transition: 'var(--transition-smooth)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* Logo Brand */}
          <a href="#" onClick={(e) => handleLinkClick(e, '#')} style={{ display: 'flex', alignItems: 'center' }}>
            <Logo variant="horizontal" height={isScrolled ? 42 : 50} />
          </a>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center' }} className="desktop-only">
            <ul style={{
              display: 'flex',
              listStyle: 'none',
              gap: '32px',
              alignItems: 'center',
            }}>
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      fontWeight: '500',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-dark)',
                      position: 'relative',
                      padding: '8px 0',
                    }}
                    className="nav-link-hover"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Booking Button and Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              className="btn-primary desktop-only"
              onClick={onBookingClick}
              style={{ padding: '10px 24px', fontSize: '11px', letterSpacing: '0.12em' }}
            >
              Book Appointment
            </button>

            {/* Mobile Hamburger Trigger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'none',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '26px',
                height: '18px',
                zIndex: 1001,
              }}
              className="mobile-hamburger"
              aria-label="Toggle menu"
            >
              <span style={{
                width: '100%',
                height: '1.5px',
                background: 'var(--color-text-dark)',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none',
              }} />
              <span style={{
                width: '80%',
                alignSelf: 'flex-end',
                height: '1.5px',
                background: 'var(--color-text-dark)',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                opacity: mobileMenuOpen ? 0 : 1,
              }} />
              <span style={{
                width: '100%',
                height: '1.5px',
                background: 'var(--color-text-dark)',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none',
              }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(250, 246, 244, 0.98)',
        backdropFilter: 'blur(20px)',
        zIndex: 999,
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
      }}>
        <div style={{ marginBottom: '40px' }}>
          <Logo variant="vertical" height={60} />
        </div>
        <ul style={{
          listStyle: 'none',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginBottom: '40px',
        }}>
          {navLinks.map((link, index) => (
            <li 
              key={link.label}
              style={{
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.4s cubic-bezier(0.25, 1, 0.5, 1) ${index * 0.05}s`,
              }}
            >
              <a 
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  letterSpacing: '0.15em',
                  color: 'var(--color-text-dark)',
                  textTransform: 'uppercase',
                  fontWeight: 300,
                  display: 'block',
                  padding: '8px 0',
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button 
          className="btn-primary"
          onClick={() => {
            setMobileMenuOpen(false);
            onBookingClick();
          }}
          style={{
            opacity: mobileMenuOpen ? 1 : 0,
            transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1) 0.4s',
          }}
        >
          Book Appointment
        </button>
      </div>

      {/* Styled JSX for custom inline layout rules */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-only {
            display: inline-flex !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }
        
        .nav-link-hover::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: 0;
          left: 0;
          background: var(--color-gold-gradient);
          transform-origin: bottom right;
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        .nav-link-hover:hover {
          color: var(--color-gold-dark) !important;
        }
        
        .nav-link-hover:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      `}</style>
    </>
  );
}
