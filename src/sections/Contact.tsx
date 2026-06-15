import React, { useState, useEffect } from 'react';
import { usePublicBranches } from '../hooks/usePublicApi';
import { publicApi } from '../lib/api';

export default function Contact() {
  const { data: branches, isLoading, isError } = usePublicBranches();
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branches && branches.length > 0 && !activeBranchId) {
      setActiveBranchId(branches[0].id);
    }
  }, [branches, activeBranchId]);

  const selectedBranch = branches?.find(b => b.id === activeBranchId);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !subject || !message) {
      setError('Please fill in all required fields.');
      return;
    }
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      await publicApi.submitInquiry({ fullName, email, phone, subject, message });
      setSuccess('Your inquiry was successfully sent. Our concierge will contact you shortly.');
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Map arbitrary coordinates for visual map based on branch index
  const getMapCoords = (idx: number) => {
    const coords = [
      { x: '50%', y: '50%' },
      { x: '25%', y: '45%' },
      { x: '75%', y: '55%' },
    ];
    return coords[idx % coords.length];
  };

  return (
    <section id="contact" className="section" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Background visual shapes */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">Locations & Inquiries</span>
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-description">
            Visit our North Haven sanctuary or reach out to us directly through our online concierge inquiry form below.
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            Loading locations...
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'red' }}>
            Failed to load locations.
          </div>
        ) : !branches || branches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
            No locations available.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '50px',
            alignItems: 'start'
          }}
          className="contact-grid"
          >
            {/* Column 1: Addresses & Map */}
            <div className="reveal-in active" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Selected Branch Detail Card */}
              {selectedBranch && (
                <div 
                  key={selectedBranch.id}
                  className="glass-panel"
                  style={{
                    padding: '36px',
                    backgroundColor: 'transparent',
                    animation: 'fadeIn 0.5s ease-in-out forwards',
                    border: '1px solid var(--color-border-light)'
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--color-gold-base)',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    {selectedBranch.displayName}
                  </span>
                  
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '28px',
                    color: 'var(--color-text-dark)',
                    marginBottom: '24px',
                    fontWeight: 400
                  }}>
                    LA Skin & Aesthetics
                  </h3>

                  {/* Grid of contact details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <div>
                        <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Address</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-dark)', fontWeight: 400 }}>
                          {selectedBranch.addressLine}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <div>
                        <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Phone</span>
                        <a href={`tel:${selectedBranch.phone}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-dark)', fontWeight: 500 }} className="contact-link">
                          {selectedBranch.phone}
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <div>
                        <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Concierge Email</span>
                        <a href={`mailto:${selectedBranch.email}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-dark)', fontWeight: 500 }} className="contact-link">
                          {selectedBranch.email}
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-base)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <div>
                        <span style={{ display: 'block', fontSize: '9px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '0.05em' }}>Hours of Reception</span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 300, lineHeight: '1.4', display: 'block', marginTop: '2px', whiteSpace: 'pre-line' }}>
                          {'Mon – Fri: 9:00 AM – 8:00 PM\nSat: 10:00 AM – 6:00 PM'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stylized Luxury Map */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/10',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
                boxShadow: 'var(--shadow-luxury)',
                overflow: 'hidden',
                background: 'var(--color-bg-tertiary)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(rgba(194, 155, 120, 0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(194, 155, 120, 0.08) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                  pointerEvents: 'none'
                }} />

                <div style={{
                  position: 'absolute',
                  width: '180px',
                  height: '100px',
                  top: '20%',
                  left: '15%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(30px)',
                  borderRadius: '50%',
                  opacity: 0.8,
                  pointerEvents: 'none'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '240px',
                  height: '140px',
                  bottom: '25%',
                  right: '10%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(40px)',
                  borderRadius: '50%',
                  opacity: 0.9,
                  pointerEvents: 'none'
                }} />

                <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', stroke: 'var(--color-gold-light)', strokeWidth: '0.8', strokeDasharray: '3 5' }}>
                  <path d="M 120,162 L 240,126 L 360,198" fill="none" />
                </svg>

                {/* Branch Pin Marker */}
                {branches.map((b, idx) => {
                  const coords = getMapCoords(idx);
                  return (
                    <div
                      key={b.id}
                      onClick={() => setActiveBranchId(b.id)}
                      style={{
                        position: 'absolute',
                        left: coords.x,
                        top: coords.y,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer',
                        zIndex: 15,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(194, 155, 120, 0.25)',
                        animation: activeBranchId === b.id ? 'pulse-gold 2s infinite' : 'none',
                        pointerEvents: 'none'
                      }} />
                      
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: activeBranchId === b.id ? 'var(--color-gold-gradient)' : 'var(--color-bg-secondary)',
                        border: '2px solid var(--color-gold-base)',
                        boxShadow: '0 2px 8px rgba(42, 36, 33, 0.2)',
                        transition: 'var(--transition-smooth)'
                      }} />

                      <span style={{
                        marginTop: '8px',
                        backgroundColor: activeBranchId === b.id ? 'var(--color-text-dark)' : 'var(--color-glass-white)',
                        color: activeBranchId === b.id ? 'var(--color-bg-primary)' : 'var(--color-text-muted)',
                        border: '1px solid var(--color-border-light)',
                        fontSize: '9px',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: '600',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-luxury)',
                        transition: 'var(--transition-smooth)',
                        whiteSpace: 'nowrap'
                      }}>
                        {b.city}
                      </span>
                    </div>
                  );
                })}

                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: 'var(--color-glass-dark)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid var(--color-border-light)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '9px',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)'
                }}>
                  Sanctuary Locator Grid
                </div>
              </div>
            </div>

            {/* Column 2: Contact message Form */}
            <div className="reveal-in active" style={{ animationDelay: '0.2s' }}>
              <div 
                className="glass-panel"
                style={{
                  padding: '36px',
                  backgroundColor: 'var(--color-glass-dark)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  color: 'var(--color-text-light)',
                  marginBottom: '24px',
                  fontWeight: 400
                }}>
                  Send Us a Message
                </h3>

                <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {success && (
                    <div style={{ padding: '12px', backgroundColor: 'rgba(0, 200, 80, 0.1)', border: '1px solid #00c850', borderRadius: 'var(--radius-sm)', color: '#00c850', fontSize: '13px' }}>
                      {success}
                    </div>
                  )}

                  {error && (
                    <div style={{ padding: '12px', backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', borderRadius: 'var(--radius-sm)', color: 'red', fontSize: '13px' }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      style={{
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>Email *</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        style={{
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--color-border-light)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'white',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>Phone</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(203) 555-0100"
                        style={{
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--color-border-light)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'white',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>Subject *</label>
                    <input 
                      type="text" 
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Booking inquiry / Custom treatment mapping"
                      style={{
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>Message *</label>
                    <textarea 
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can our aesthetic specialists assist you today?"
                      style={{
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        resize: 'none'
                      }}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={sending}
                    style={{
                      background: 'var(--color-gold-gradient)',
                      border: 'none',
                      color: 'white',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: sending ? 'default' : 'pointer',
                      transition: 'var(--transition-smooth)',
                      marginTop: '10px'
                    }}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-gold {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        
        .contact-link:hover {
          color: var(--color-gold-dark) !important;
          text-decoration: underline;
        }
        
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
        }
      `}</style>
    </section>
  );
}
